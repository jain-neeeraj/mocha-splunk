# mocha-splunk

This is a reporter for Mocha to log test results to Splunk. 

**Installation**
    ---- WIP

**Usage**
This reporter will log below mentioned information to splunk
1. Test run number
2. Git branch
3. Test duration
4. Test title
5. Test result
6. Additional debug information
To use this in your Mocha tests, update your run command to use Mocha-Splunk reporter as below:
`mocha --reporter mocha-splunk --reporter-options <> testfiles.js`
 
 To use the reporter, below is list of reporter options that needs to be setup

**| Option | Required |Description |**
|--|--|--|
|  run_no | No| Test run number / build number|
|  test_env| No| Test environment e.g. QA/UAT |
|  git_branch| No| Git branch under test|
|  splunk_host| yes | Splunk host name e.g. splunk.com:8088|
|  splunk_url| No| URL for event collector|
|  splunk_token| yes | Splunk HTTP token|
|  debug| No| print debug information from the reporter |
