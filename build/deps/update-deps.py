#!/usr/bin/python3
"""
Usage: update-deps.py [dep_name]
"""

import datetime
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from pathlib import Path

TARGET_FILTER = None if len(sys.argv) < 2 else sys.argv[1]

SCRIPT_DIR = Path(__file__).resolve().parent
if "BUILD_WORKSPACE_DIRECTORY" in os.environ:
    SCRIPT_DIR = Path(os.environ["BUILD_WORKSPACE_DIRECTORY"]) / "build" / "deps"

DEPS_JSON = SCRIPT_DIR / "deps.jsonc"
BUILD_DEPS_JSON = SCRIPT_DIR / "build_deps.jsonc"
GEN_DIR = SCRIPT_DIR / "gen"
DEPS_BZL = GEN_DIR / "deps.bzl"
BUILD_DEPS_BZL = GEN_DIR / "build_deps.bzl"


TOP = "# WARNING: THIS FILE IS AUTOGENERATED BY update-deps.py DO NOT EDIT\n"

GITHUB_TAR_URL_TEMPLATE = "https://github.com/{owner}/{repo}/tarball/{commit}"

GITHUB_RELEASE_FILE_URL_TEMPLATE = (
    "https://github.com/{owner}/{repo}/releases/download/v{version}/{file}"
)

HTTP_ARCHIVE_TEMPLATE = (
    TOP
    + """
load("@//:build/http.bzl", "http_archive")

URL = "{url}"
STRIP_PREFIX = "{prefix}"
SHA256 = "{sha256}"
TYPE = "{type}"{extra_exports}

def {macro_name}():
    http_archive(
        name = "{name}",
        url = URL,
        strip_prefix = STRIP_PREFIX,
        type = TYPE,
        sha256 = SHA256,{extra_attrs}
    )
"""
)

GITHUB_RELEASE_ARCHIVE_TEMPLATE = (
    TOP
    + """
load("@//:build/http.bzl", "http_archive")

TAG_NAME = "{tag_name}"
URL = "{url}"
STRIP_PREFIX = "{prefix}"
SHA256 = "{sha256}"
TYPE = "{type}"

def {macro_name}():
    http_archive(
        name = "{name}",
        url = URL,
        strip_prefix = STRIP_PREFIX,
        type = TYPE,
        sha256 = SHA256,{extras}
    )
"""
)

GITHUB_RELEASE_FILE_TEMPLATE = (
    TOP
    + """
load("@//:build/http.bzl", "http_file")

TAG_NAME = "{tag_name}"
URL = "{url}"
SHA256 = "{sha256}"

def {macro_name}():
    http_file(
        name = "{name}",
        url = URL,
        executable = True,
        sha256 = SHA256,{extras}
    )
"""
)

NEW_GIT_REPOSITORY_TEMPLATE = (
    TOP
    + """
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

URL = "{url}"
COMMIT = "{commit}"

def {macro_name}():
    git_repository(
        name = "{name}",
        remote = URL,
        commit = COMMIT,{extras}
    )
"""
)

V8_REVISION_TEMPLATE = (
    TOP
    + """
V8_COMMIT="{v8_commit}"
"""
)

GITHUB_ACCESS_TOKEN = ""


def macro_name(repo):
    return "dep_" + repo["name"].replace("-", "_")


class RateLimitedException(Exception):
    pass


class AssetsException(Exception):
    pass


class UnsupportedException(Exception):
    pass


def github_urlopen(url):
    """
    A wrapper around urllib.request.urlopen() which parses GitHub rate limit errors and
    provides a more human-friendly explanation.
    """
    if GITHUB_ACCESS_TOKEN != "":
        url = urllib.request.Request(url)
        url.add_header("Authorization", f"Bearer {GITHUB_ACCESS_TOKEN}")
    try:
        return urllib.request.urlopen(url)
    except urllib.error.HTTPError as e:
        reset_ts = e.headers["x-ratelimit-reset"]
        if e.code != 403 or not reset_ts:
            raise
        reset_dt = datetime.datetime.fromtimestamp(int(reset_ts))
        reset_iso_utc = reset_dt.astimezone(datetime.UTC).isoformat(" ")
        reset_iso_local = reset_dt.isoformat(" ")
        raise RateLimitedException(
            f"""
We have been rate-limited by GitHub. We can make API calls again at:
  {reset_iso_utc} UTC ({reset_iso_local} local time).
"""
            + """
You can try re-running the script and specifying an access token since authenticated
GitHub API requests have a higher rate limit.
"""
            if GITHUB_ACCESS_TOKEN == ""
            else ""
        ) from e


def github_last_commit(repo):
    owner = repo["owner"]
    github_repo = repo["repo"]
    branch = repo.get("branch", "master")
    api_url = f"https://api.github.com/repos/{owner}/{github_repo}/commits/{branch}"
    commits = json.loads(github_urlopen(api_url).read())
    return commits["sha"]


def get_url_content_sha256(url):
    return hashlib.sha256(urllib.request.urlopen(url).read()).hexdigest()


def extra_attributes(repo):
    extras = ""
    if "build_file" in repo:
        extras += f'\n        build_file = "{repo["build_file"]}",'
    if "build_file_content" in repo:
        extras += f'\n        build_file_content = "{repo["build_file_content"]}",'
    if "repo_mapping" in repo:
        extras += f"\n        repo_mapping = {json.dumps(repo['repo_mapping'])},"
    if "patches" in repo:
        patches = str(repo["patches"]).replace("'", '"')
        extras += f"\n        patches = {patches},"
        extras += '\n        patch_args = ["-p1"],'
    if "downloaded_file_path" in repo:
        p = repo["downloaded_file_path"]
        extras += f'\n        downloaded_file_path = "{p}",'

    return extras


def gen_github_tarball(repo):
    owner = repo["owner"]
    github_repo = repo["repo"]

    commit = github_last_commit(repo)
    if "freeze_commit" in repo:
        if repo["freeze_commit"] != commit:
            print(
                "frozen, update available ",
                repo["freeze_commit"][:7],
                " -> ",
                commit[:7],
                end="",
            )
        commit = repo["freeze_commit"]
    else:
        print(commit[:7], end="")

    prefix = f"{owner}-{github_repo}-{commit[:7]}"
    if "extra_strip_prefix" in repo:
        prefix = prefix + repo["extra_strip_prefix"]

    url = GITHUB_TAR_URL_TEMPLATE.format(
        owner=owner,
        repo=github_repo,
        commit=commit,
    )

    if "freeze_sha256" in repo:
        sha256 = repo["freeze_sha256"]
    else:
        sha256 = get_url_content_sha256(url)

    extra_exports = f'\nCOMMIT = "{commit}"'
    if "patches" in repo:
        extra_exports += f"\nPATCHES = {repo['patches']}".replace("'", '"')

    return HTTP_ARCHIVE_TEMPLATE.format(
        name=repo["name"],
        url=url,
        prefix=prefix,
        sha256=sha256,
        macro_name=macro_name(repo),
        extra_attrs=extra_attributes(repo),
        extra_exports=extra_exports,
        type="tgz",
    )


def github_last_release(repo):
    owner = repo["owner"]
    github_repo = repo["repo"]
    api_url = f"https://api.github.com/repos/{owner}/{github_repo}/releases/latest"
    return json.loads(github_urlopen(api_url).read())


def github_release(repo, tag_name):
    owner = repo["owner"]
    github_repo = repo["repo"]
    api_url = (
        f"https://api.github.com/repos/{owner}/{github_repo}/releases/tags/{tag_name}"
    )
    return json.loads(github_urlopen(api_url).read())


def gen_github_release(repo):
    try:
        release = github_last_release(repo)
    except urllib.error.HTTPError as e:
        # If a repo only has pre-releases, github_last_release will throw a 404 error.
        # In that case, we must specify a "freeze_version".
        if e.code != 404 or "freeze_version" not in repo:
            raise
        release = None

    if "freeze_version" in repo:
        frozen_release = github_release(repo, repo["freeze_version"])
        if release is not None and frozen_release["tag_name"] != release["tag_name"]:
            print(
                "frozen, update available: {} -> {}".format(
                    frozen_release["tag_name"], release["tag_name"]
                ),
                end="",
            )
        release = frozen_release
    else:
        print(release["tag_name"], end="")

    assets = release["assets"]
    if "file_regex" in repo:
        file_regex = re.compile(repo["file_regex"])
        assets = [a for a in assets if file_regex.match(a["name"])]

    if len(assets) == 0:
        if "tarball_url" in release:
            url = release["tarball_url"]
        else:
            raise AssetsException("No assets found: " + json.dumps(release))
    elif len(assets) > 1:
        raise AssetsException(
            "Too many assets, use more specific file_regex: "
            + str([a["name"] for a in assets])
        )
    else:
        asset = assets[0]
        url = asset["browser_download_url"]

    type = "tgz"
    if url.endswith(".zip"):
        type = "zip"
    elif url.endswith(".xz"):
        type = "xz"
    elif url.endswith(".tar.bz2"):
        type = "tar.bz2"

    content = urllib.request.urlopen(url).read()

    if "freeze_sha256" in repo:
        sha256 = repo["freeze_sha256"]
    else:
        sha256 = hashlib.sha256(content).hexdigest()

    file_type = repo.get("file_type", "archive")
    if file_type == "archive":
        if "strip_prefix" in repo:
            prefix = repo["strip_prefix"]
        elif url.endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(content)) as zip:
                prefix = os.path.commonprefix(zip.namelist())
        else:
            with tarfile.open(fileobj=io.BytesIO(content)) as tgz:
                prefix = os.path.commonprefix(tgz.getnames())

        return GITHUB_RELEASE_ARCHIVE_TEMPLATE.format(
            name=repo["name"],
            url=url,
            prefix=prefix,
            sha256=sha256,
            macro_name=macro_name(repo),
            type=type,
            extras=extra_attributes(repo),
            tag_name=release["tag_name"],
        )
    elif file_type == "executable":
        return GITHUB_RELEASE_FILE_TEMPLATE.format(
            name=repo["name"],
            url=url,
            sha256=sha256,
            macro_name=macro_name(repo),
            extras=extra_attributes(repo),
            tag_name=release["tag_name"],
        )
    else:
        raise UnsupportedException("Unsupported file_type: " + file_type)


def gen_git_clone(repo):
    url = repo["url"]

    # We used to clone the repository here to get a shallow_since timestamp, but based
    # on # https://github.com/bazelbuild/bazel/issues/12857 it is unclear if this is
    # actually helpful.
    ls_remote = subprocess.run(
        ["git", "ls-remote", url, repo["branch"]], capture_output=True, text=True
    )
    ls_remote.check_returncode()
    commit = ls_remote.stdout.strip().split()[0]

    if "freeze_commit" in repo:
        freeze_commit = repo["freeze_commit"]
        if freeze_commit != commit:
            print(
                "frozen, update available ",
                repo["freeze_commit"][:7],
                " -> ",
                commit[:7],
                end="",
            )
            commit = freeze_commit
        else:
            print(commit[:7], end="")

    return NEW_GIT_REPOSITORY_TEMPLATE.format(
        name=repo["name"],
        macro_name=macro_name(repo),
        url=url,
        commit=commit,
        extras=extra_attributes(repo),
    )


def gen_crate(repo):
    name = repo["name"]

    # find crate's latest version
    crates_json_url = f"https://crates.io/api/v1/crates/{name}"
    crate = json.loads(urllib.request.urlopen(crates_json_url).read())
    version = crate["versions"][0]

    if "freeze_version" in repo:
        last_version = version
        version = next(
            v for v in crate["versions"] if v["num"] == repo["freeze_version"]
        )
        if last_version["num"] != version["num"]:
            print(
                "frozen, update available ",
                version["num"],
                " -> ",
                last_version["num"],
                end="",
            )
    else:
        print(version["num"], end="")

    prefix = f"{name}-{version['num']}"
    url = f"https://crates.io{version['dl_path']}"
    extra_exports = f'\nVERSION = "{version["num"]}"'

    return HTTP_ARCHIVE_TEMPLATE.format(
        name=repo["name"],
        url=url,
        prefix=prefix,
        sha256=version["checksum"],
        macro_name=macro_name(repo),
        extra_attrs=extra_attributes(repo),
        extra_exports=extra_exports,
        type="tgz",
    )


def gen_repo_str(repo):
    if repo["type"] == "github_tarball":
        return gen_github_tarball(repo)
    elif repo["type"] == "github_release":
        return gen_github_release(repo)
    elif repo["type"] == "git_clone":
        return gen_git_clone(repo)
    elif repo["type"] == "crate":
        return gen_crate(repo)
    else:
        raise UnsupportedException(f"Unsupported repo type: {repo['type']}")


def gen_repo_bzl(repo):
    print("Checking", repo["name"], "... ", end="", flush=True)
    if TARGET_FILTER is not None and not repo["name"].startswith(TARGET_FILTER):
        print("skipped")
        return
    with (GEN_DIR / f"{macro_name(repo)}.bzl").open("w") as bzl_file:
        bzl_file.write(gen_repo_str(repo))
    print()


def gen_deps_bzl(deps, deps_bzl):
    deps_bzl_content = TOP
    macro_names = [macro_name(repo) for repo in deps["repositories"]]

    for name in sorted(macro_names):
        # Buildifier prefers load statements to be sorted alphabetically.
        deps_bzl_content += f'\nload("@//build/deps:gen/{name}.bzl", "{name}")'
    deps_bzl_content += "\n\ndef deps_gen():\n"
    for name in macro_names:
        deps_bzl_content += f"    {name}()\n"

    with deps_bzl.open("w") as f:
        f.write(deps_bzl_content)


def process_deps(deps, deps_bzl):
    for repo in deps["repositories"]:
        gen_repo_bzl(repo)
    gen_deps_bzl(deps, deps_bzl)


def strip_comments(text):
    # capture string literals first, comments send
    regex = re.compile(r"(\".*\")|(//.*$)", re.MULTILINE)
    return regex.sub(
        lambda match: "" if match.group(2) is not None else match.group(1), text
    )


def read_access_token():
    # TODO(someday): It is somewhat inconvenient for the user to have to specify
    # the value of the # access token. We should either use a python library to redirect
    # the user to authenticate via # the browser via an appropriate oauth flow or
    # use `gh auth login` and `gh api`.
    if TARGET_FILTER is None:
        global GITHUB_ACCESS_TOKEN
        if sys.stdin.isatty():
            print(
                """Follow these steps to obtain a GitHub API access token with
appropriate permissions:

1. On github.com, go to
    Settings > Developer Settings > Personal access tokens > Fine-grained tokens.
2. Generate a new token with default settings.
"""
            )
            print(
                "Please enter GitHub API access token (or empty to skip): ",
                end="",
                flush=True,
            )
            GITHUB_ACCESS_TOKEN = sys.stdin.readline().strip("\n")
        else:
            GITHUB_ACCESS_TOKEN = ""


def run():
    read_access_token()

    if TARGET_FILTER is None:
        for f in GEN_DIR.glob("*.bzl"):
            f.unlink()

    with DEPS_JSON.open() as deps_json:
        json_text = strip_comments(deps_json.read())
        process_deps(json.loads(json_text), DEPS_BZL)

    with BUILD_DEPS_JSON.open() as deps_json:
        json_text = strip_comments(deps_json.read())
        process_deps(json.loads(json_text), BUILD_DEPS_BZL)


run()
