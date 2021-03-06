var https = require('follow-redirects').https;

const setOptions = (options) => {
    this.run_identifier = options.useProcessVar && process.env.run_no?process.env.run_no:(options.run_no?options.run_no:'local_run');
    this.test_env = options.useProcessVar && process.env.test_env? process.env.test_env :options.test_env;
    this.git_branch = options.useProcessVar && process.env.git_branch? process.env.git_branch:(options.git_branch?options.git_branch:'local_run');
    this.splunk_host = options.useProcessVar && process.env.splunk_host? process.env.splunk_host:options.splunk_host;
    this.splunk_url = options.useProcessVar && process.env.splunk_url? process.env.splunk_url:(options.splunk_url?options.splunk_url:'/services/collector');
    this.splunk_token = options.useProcessVar && process.env.splunk_token? process.env.splunk_token:options.splunk_token;
    this.splunk_source= options.useProcessVar && process.env.splunk_source? process.env.splunk_source:(options.splunk_source?options.splunk_source:'mocha_tests')
    this.debug = options.debug
}

const prepareMessage = (test, err) => {
    return {
        test_run: this.run_identifier, test_environment: this.test_env,
        git_branch: this.git_branch,
        result: test.state,
        title: test.title, 
        test_details: {
            full_title: test.fullTitle(),
            debug_data: test.splunkContext ? test.splunkContext : undefined,
            error: err ? err.message : undefined,
            test_duration: test.duration,
            actual_value: err ? err.actual : undefined,
            expected_value: err ? err.expected : undefined,
        }
    }
}

const logDebug = (message) => {
    if (this.debug)
        console.log(`Mocha Splunk Reporter: ${message}`)
}

const data_dispatcher = (data_to_send) => {
    if(!this.splunk_host){
        console.log("Splunk host config not found. skipping the logging");
        return
    }
    try{
        const data = JSON.stringify({
            "event": data_to_send,"sourcetype":"_json","source":this.splunk_source
        })
        let regex = new RegExp("/^(http[s]?:\\/\\/){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(\\/(.)*)?/");
        if(regex.test(this.splunk_host)){
            throw `Splunk host config is not in correct format. Make sure you remove http/https from the host name. Received input is ${this.splunk_host}`
        }
        const hostDetails = this.splunk_host.split(':');
        const hostname = hostDetails.length==2?hostDetails[0]:this.splunk_host;
        const port = hostDetails.length==2?hostDetails[1]:8088;
        if(hostDetails.length>2){
            throw `Splunk host config is not in correct format. Make sure you remove http/https from the host. Received input is ${this.splunk_host}`
        }
        const options = {
            hostname: hostname,
            port: port,
            path: this.splunk_url.trim(),
            rejectUnauthorized: false,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Splunk ${this.splunk_token.trim()}`
            }
        };

        logDebug(JSON.stringify(options,null,2));

        const req = https.request(options, function (res) {
            var chunks = [];
                logDebug(`statusCode: ${res.statusCode}`);
                if (res.statusCode != 200) {
                    logDebug(`response statusCode from Splunk: ${res.statusCode}`);
                    res.on('data', d => {
                        logDebug(d);
                    })
                }
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                logDebug(`statusCode: ${body.toString()}`);
            });

            res.on("error", function (error) {
                console.error(`Mocha Splunk Reporter: ${error}`)
            });
        });
        
        req.write(data);
        req.end();}
    catch (e) {
        console.trace("Mocha Splunk Reporter: got exception \n"+e)
    }
}

module.exports = {
    setOptions,
    prepareMessage,
    logDebug,
    data_dispatcher
}
