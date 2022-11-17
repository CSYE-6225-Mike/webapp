const AWS = require("aws-sdk");

class sns {
    constructor(topicArn, region, logger) {
        this.topicArn = topicArn;
        this.logger = logger;
        this.region = region;
        AWS.config.update({ region: region });
        this.sns = new AWS.SNS({
            region: this.region,
        });
    }

    async publishMessage(message) {
        const params = {
            Message: message,
            TopicArn: this.topicArn,
        };

        try {
            const messageData = await this.sns.publish(params).promise();
            this.logger.info(
                `Message ${params.Message} sent to the topic ${params.TopicArn} with id ${messageData.MessageId}`
            );
        } catch (err) {
            console.log(err.message);
        }
    }
}

module.exports = sns;