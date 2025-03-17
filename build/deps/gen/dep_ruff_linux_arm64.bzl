# WARNING: THIS FILE IS AUTOGENERATED BY update-deps.py DO NOT EDIT

load("@//:build/http.bzl", "http_archive")

TAG_NAME = "0.11.0"
URL = "https://github.com/astral-sh/ruff/releases/download/0.11.0/ruff-aarch64-unknown-linux-gnu.tar.gz"
STRIP_PREFIX = "ruff-aarch64-unknown-linux-gnu"
SHA256 = "e4e69fe47ad319aeef0983e26e927907d7521214a7d72c79cf2e2b15316ecfa5"
TYPE = "tgz"

def dep_ruff_linux_arm64():
    http_archive(
        name = "ruff-linux-arm64",
        url = URL,
        strip_prefix = STRIP_PREFIX,
        type = TYPE,
        sha256 = SHA256,
        build_file_content = "filegroup(name='file', srcs=glob(['**']))",
    )
