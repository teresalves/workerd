// Copyright (c) 2017-2022 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { type TestRunnerConfig } from 'wpt:harness';

export default {
  'urlpattern-compare-tests.tentative.js': {
    comment: 'URLPattern.compareComponent is not part of the URLPattern spec',
    skipAllTests: true,
  },
  'urlpattern-compare.tentative.any.js': {
    comment: 'URLPattern.compareComponent is not part of the URLPattern spec',
    skipAllTests: true,
  },
  'urlpattern-compare.tentative.https.any.js': {
    comment: 'URLPattern.compareComponent is not part of the URLPattern spec',
    skipAllTests: true,
  },
  'urlpattern-hasregexpgroups-tests.js': {
    comment: 'urlpattern implementation will soon be replaced with ada-url',
    expectedFailures: [
      // Each of these *ought* to pass. They are included here because we
      // know they currently do not. Each needs to be investigated.
      '', // This file consists of one unnamed subtest
    ],
  },
  'urlpattern-hasregexpgroups.any.js': {},
  'urlpattern.any.js': {},
  'urlpattern.https.any.js': {},
  'urlpatterntests.js': {
    comment: 'urlpattern implementation will soon be replaced with ada-url',
    expectedFailures: [
      // Each of these *ought* to pass. They are included here because we
      // know they currently do not. Each needs to be investigated.
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"hostname":"example.com","pathname":"/foo/bar"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar/baz"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar","search":"otherquery","hash":"otherhash"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar","search":"otherquery","hash":"otherhash"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?otherquery#otherhash"}] Inputs: [{"protocol":"https","hostname":"example.com","pathname":"/foo/bar","search":"otherquery","hash":"otherhash"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["https://example.com/foo/bar"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["https://example.com/foo/bar?otherquery#otherhash"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["https://example.com/foo/bar?query#hash"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["https://example.com/foo/bar/baz"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["https://other.com/foo/bar"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: ["http://other.com/foo/bar"]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar","baseURL":"https://example.com"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar/baz","baseURL":"https://example.com"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar","baseURL":"https://other.com"}]',
      'Pattern: [{"pathname":"/foo/bar","baseURL":"https://example.com?query#hash"}] Inputs: [{"pathname":"/foo/bar","baseURL":"http://example.com"}]',
      'Pattern: [{"pathname":"/foo/:bar?"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"pathname":"/foo/:bar*"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"pathname":"/foo/(.*)?"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"pathname":"/foo/*?"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"pathname":"/foo/(.*)*"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"pathname":"/foo/**"}] Inputs: [{"pathname":"/foo"}]',
      'Pattern: [{"protocol":"(.*)"}] Inputs: [{"protocol":"café"}]',
      'Pattern: [{"hostname":"xn--caf-dma.com"}] Inputs: [{"hostname":"café.com"}]',
      'Pattern: [{"hostname":"café.com"}] Inputs: [{"hostname":"café.com"}]',
      'Pattern: [{"protocol":"http","port":"80"}] Inputs: [{"protocol":"http","port":"80"}]',
      'Pattern: [{"protocol":"http","port":"80 "}] Inputs: [{"protocol":"http","port":"80"}]',
      'Pattern: [{"port":"(.*)"}] Inputs: [{"port":"invalid80"}]',
      'Pattern: [{"pathname":"/foo/bar"}] Inputs: [{"pathname":"foo/bar"}]',
      'Pattern: [{"pathname":"./foo/bar","baseURL":"https://example.com"}] Inputs: [{"pathname":"foo/bar","baseURL":"https://example.com"}]',
      'Pattern: [{"pathname":"","baseURL":"https://example.com"}] Inputs: [{"pathname":"/","baseURL":"https://example.com"}]',
      'Pattern: [{"pathname":"{/bar}","baseURL":"https://example.com/foo/"}] Inputs: [{"pathname":"./bar","baseURL":"https://example.com/foo/"}]',
      'Pattern: [{"pathname":"\\\\/bar","baseURL":"https://example.com/foo/"}] Inputs: [{"pathname":"./bar","baseURL":"https://example.com/foo/"}]',
      'Pattern: [{"pathname":"b","baseURL":"https://example.com/foo/"}] Inputs: [{"pathname":"./b","baseURL":"https://example.com/foo/"}]',
      'Pattern: [{"pathname":"foo/bar","baseURL":"https://example.com"}] Inputs: ["https://example.com/foo/bar"]',
      'Pattern: [{"pathname":":name.html","baseURL":"https://example.com"}] Inputs: ["https://example.com/foo.html"]',
      'Pattern: [{"protocol":"javascript","pathname":"var x = 1;"}] Inputs: [{"protocol":"javascript","pathname":"var x = 1;"}]',
      'Pattern: [{"protocol":"(data|javascript)","pathname":"var x = 1;"}] Inputs: [{"protocol":"javascript","pathname":"var x = 1;"}]',
      'Pattern: [{"pathname":"var x = 1;"}] Inputs: [{"pathname":"var x = 1;"}]',
      'Pattern: ["https://example.com:8080/foo?bar#baz"] Inputs: [{"pathname":"/foo","search":"bar","hash":"baz","baseURL":"https://example.com:8080"}]',
      'Pattern: ["/foo?bar#baz","https://example.com:8080"] Inputs: [{"pathname":"/foo","search":"bar","hash":"baz","baseURL":"https://example.com:8080"}]',
      'Pattern: ["http{s}?://{*.}?example.com/:product/:endpoint"] Inputs: ["https://sub.example.com/foo/bar"]',
      'Pattern: ["https://example.com?foo"] Inputs: ["https://example.com/?foo"]',
      'Pattern: ["https://example.com#foo"] Inputs: ["https://example.com/#foo"]',
      'Pattern: ["https://example.com:8080?foo"] Inputs: ["https://example.com:8080/?foo"]',
      'Pattern: ["https://example.com:8080#foo"] Inputs: ["https://example.com:8080/#foo"]',
      'Pattern: ["https://example.com/?foo"] Inputs: ["https://example.com/?foo"]',
      'Pattern: ["https://example.com/#foo"] Inputs: ["https://example.com/#foo"]',
      'Pattern: ["https://example.com/*?foo"] Inputs: ["https://example.com/?foo"]',
      'Pattern: ["https://example.com/*\\\\?foo"] Inputs: ["https://example.com/?foo"]',
      'Pattern: ["https://example.com/:name?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/:name\\\\?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/(bar)?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/(bar)\\\\?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/{bar}?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/{bar}\\\\?foo"] Inputs: ["https://example.com/bar?foo"]',
      'Pattern: ["https://example.com/"] Inputs: ["https://example.com:8080/"]',
      'Pattern: ["data\\\\:foobar"] Inputs: ["data:foobar"]',
      'Pattern: ["https://{sub.}?example.com/foo"] Inputs: ["https://example.com/foo"]',
      'Pattern: ["https://(sub.)?example.com/foo"] Inputs: ["https://example.com/foo"]',
      'Pattern: ["https://(sub.)?example(.com/)foo"] Inputs: ["https://example.com/foo"]',
      'Pattern: ["https://(sub(?:.))?example.com/foo"] Inputs: ["https://example.com/foo"]',
      'Pattern: ["file:///foo/bar"] Inputs: ["file:///foo/bar"]',
      'Pattern: ["data:"] Inputs: ["data:"]',
      'Pattern: ["foo://bar"] Inputs: ["foo://bad_url_browser_interop"]',
      'Pattern: ["https://example.com/foo?bar#baz"] Inputs: [{"protocol":"https:","search":"?bar","hash":"#baz","baseURL":"http://example.com/foo"}]',
      'Pattern: ["?bar#baz","https://example.com/foo"] Inputs: ["?bar#baz","https://example.com/foo"]',
      'Pattern: ["?bar","https://example.com/foo#baz"] Inputs: ["?bar","https://example.com/foo#snafu"]',
      'Pattern: ["#baz","https://example.com/foo?bar"] Inputs: ["#baz","https://example.com/foo?bar"]',
      'Pattern: ["#baz","https://example.com/foo"] Inputs: ["#baz","https://example.com/foo"]',
      'Pattern: ["https://foo\\\\:bar@example.com"] Inputs: ["https://foo:bar@example.com"]',
      'Pattern: ["https://foo@example.com"] Inputs: ["https://foo@example.com"]',
      'Pattern: ["https://\\\\:bar@example.com"] Inputs: ["https://:bar@example.com"]',
      'Pattern: ["https://:user::pass@example.com"] Inputs: ["https://foo:bar@example.com"]',
      'Pattern: ["https\\\\:foo\\\\:bar@example.com"] Inputs: ["https:foo:bar@example.com"]',
      'Pattern: ["data\\\\:foo\\\\:bar@example.com"] Inputs: ["data:foo:bar@example.com"]',
      'Pattern: ["https://foo{\\\\:}bar@example.com"] Inputs: ["https://foo:bar@example.com"]',
      'Pattern: ["data{\\\\:}channel.html","https://example.com"] Inputs: ["https://example.com/data:channel.html"]',
      'Pattern: ["http://[\\\\:\\\\:1]/"] Inputs: ["http://[::1]/"]',
      'Pattern: ["http://[\\\\:\\\\:1]:8080/"] Inputs: ["http://[::1]:8080/"]',
      'Pattern: ["http://[\\\\:\\\\:a]/"] Inputs: ["http://[::a]/"]',
      'Pattern: ["http://[:address]/"] Inputs: ["http://[::1]/"]',
      'Pattern: ["http://[\\\\:\\\\:AB\\\\::num]/"] Inputs: ["http://[::ab:1]/"]',
      'Pattern: [{"hostname":"[\\\\:\\\\:AB\\\\::num]"}] Inputs: [{"hostname":"[::ab:1]"}]',
      'Pattern: ["data\\\\:text/javascript,let x = 100/:tens?5;"] Inputs: ["data:text/javascript,let x = 100/5;"]',
      'Pattern: [{"pathname":"/foo"},"https://example.com"] Inputs: undefined',
      'Pattern: [{"pathname":":name*"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":name+"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":name"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":"(foo)(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{(foo)bar}(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"(foo)?(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}(barbaz)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}{(.*)}"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}{bar(.*)}"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}:bar(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo}?(.*)"}] Inputs: [{"pathname":"foobarbaz"}]',
      'Pattern: [{"pathname":"{:foo\\\\bar}"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":"{:foo\\\\.bar}"}] Inputs: [{"pathname":"foo.bar"}]',
      'Pattern: [{"pathname":"{:foo(foo)bar}"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":"{:foo}bar"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":foo\\\\bar"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":foo{}(.*)"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":foo{}bar"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":foo{}?bar"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":"*{}**?"}] Inputs: [{"pathname":"foobar"}]',
      'Pattern: [{"pathname":":foo(baz)(.*)"}] Inputs: [{"pathname":"bazbar"}]',
      'Pattern: [{"pathname":":foo(baz)bar"}] Inputs: [{"pathname":"bazbar"}]',
      'Pattern: [{"pathname":"*/*"}] Inputs: [{"pathname":"foo/bar"}]',
      'Pattern: [{"pathname":"*\\\\/*"}] Inputs: [{"pathname":"foo/bar"}]',
      'Pattern: [{"pathname":"*/{*}"}] Inputs: [{"pathname":"foo/bar"}]',
      'Pattern: [{"pathname":"./foo"}] Inputs: [{"pathname":"./foo"}]',
      'Pattern: [{"pathname":"../foo"}] Inputs: [{"pathname":"../foo"}]',
      'Pattern: [{"pathname":":foo./"}] Inputs: [{"pathname":"bar./"}]',
      'Pattern: [{"pathname":":foo../"}] Inputs: [{"pathname":"bar../"}]',
      'Pattern: [{"pathname":"/:foo\\\\bar"}] Inputs: [{"pathname":"/bazbar"}]',
      'Pattern: ["https://example.com:8080/foo?bar#baz",{"ignoreCase":true}] Inputs: [{"pathname":"/FOO","search":"BAR","hash":"BAZ","baseURL":"https://example.com:8080"}]',
      'Pattern: ["/foo?bar#baz","https://example.com:8080",{"ignoreCase":true}] Inputs: [{"pathname":"/FOO","search":"BAR","hash":"BAZ","baseURL":"https://example.com:8080"}]',
      'Pattern: [{"search":"foo","baseURL":"https://example.com/a/+/b"}] Inputs: [{"search":"foo","baseURL":"https://example.com/a/+/b"}]',
      'Pattern: [{"hash":"foo","baseURL":"https://example.com/?q=*&v=?&hmm={}&umm=()"}] Inputs: [{"hash":"foo","baseURL":"https://example.com/?q=*&v=?&hmm={}&umm=()"}]',
      'Pattern: ["#foo","https://example.com/?q=*&v=?&hmm={}&umm=()"] Inputs: ["https://example.com/?q=*&v=?&hmm={}&umm=()#foo"]',
      'Pattern: [{"pathname":"/([[a-z]--a])"}] Inputs: [{"pathname":"/a"}]',
      'Pattern: [{"pathname":"/([[a-z]--a])"}] Inputs: [{"pathname":"/z"}]',
      'Pattern: [{"pathname":"/([\\\\d&&[0-1]])"}] Inputs: [{"pathname":"/0"}]',
      'Pattern: [{"pathname":"/([\\\\d&&[0-1]])"}] Inputs: [{"pathname":"/3"}]',
    ],
  },
} satisfies TestRunnerConfig;
