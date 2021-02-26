// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const gohoubiA = () => {

    return 'ココナッツウォーターと,はちみつです';
};
const gohoubiB = () => {
    return `ホットアイマスクと入浴剤です`
};
const firstSpeech = () => {
    return [
        '運動チャレンジへようこそ。',
        'このスキルはあなたを健康に導く魔法のスキルです。このチャレンジを7日間続けることによって、ご褒美が1つもらえます。',
        `最初にご褒美を決めましょう。`,
        'いちは',gohoubiA(),`,`,
        'には',gohoubiB(),`,`,
        `あなたは１ですか、それとも２ですか. `
    ].join('');
};
const nSpeech = (n) => {
    return [
        '運動チャレンジへようこそ。',
        `ご褒美をもらえるには残り${n}日運動チャレンジを頑張りましょう。`,
        `運動を開始する場合は、スタートと言ってください。`
    ].join('');
};

const exercise = () => {
    return [
        `では、今日の運動に入ります。今日は腕立て伏せ30秒です。`,
        `手を肩幅に開いて床に置き、足をまっすぐ伸ばしたまま、肘を伸ばしたりし曲げたりしましょう！`,
        `それでは音楽に合わせて開始しましょう！`
        //`音の再生`, 提案残り１０秒！などの条件分岐が難しい。音声で解決したい
    ].join('');
};

const check = (bool) => {
    return [
        `いかがだったでしょうか`,
        `１分間きちんとできました？`,
        `はい、またはいいえ、で教えてください`
    ].join('');

};

const congraturate = () =>{
    return [
        `よく頑張りました、７日間のチャレンジ終了です`,
        //`拍手の音源`
        `おめでとうございます！、ご褒美の購入リンクをお送りしますので、アレクサアプリをご確認ください。お疲れ様でした！`,
        `来週のご褒美は、`,
        // ドラム音的なものが欲しい
        `１はラズベリープロテインバーと２はアロマキャンドルです。お楽しみに`
    ].join('');

};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        let attr = await handlerInput.attributesManager.getPersistentAttributes();
        let speechText;
        if(!attr.count) {
            speechText = firstSpeech();
        } else {
            speechText= nSpeech(attr.count);
            
        }
        attr.count = (attr.count || 8) - 1;
        handlerInput.attributesManager.setPersistentAttributes(attr);
        await handlerInput.attributesManager.savePersistentAttributes();
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const SelectIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SelectIntent';
    },
    handle(handlerInput) {
        var number = Number(handlerInput.requestEnvelope.request.intent.slots.number.value);
        let speechText;
        if (!number || number >2 || number ===0) {
            speechText = '1か2で答えてください。';
            return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
        }  else if (number === 1) {
            speechText = `${number}の${gohoubiA()}ね？では7日間頑張りましょう。それでは１分後に運動を始めましょう。　`;
        } else if(number ===2) {
            speechText = `${number}の${gohoubiB()}ね？では7日間頑張りましょう。それでは１分後に運動を始めましょう。`;
        }
        // リマインダーAPIの呼び出し
        //終了　インテント、終了することの確認を入れる
        return handlerInput.responseBuilder
            .speak(speechText+`スキルを一度終了します`)
            .getResponse();
    }
};


const StartIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartIntent';
    },
    handle(handlerInput) {
        let speechText = exercise();
        speechText += `お疲れ様でした！明日も頑張りましょう！`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};

const ResetIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResetIntent';
    },
    async handle(handlerInput) {
        let attr = await handlerInput.attributesManager.getPersistentAttributes();
        attr.count = 0;
        handlerInput.attributesManager.setPersistentAttributes(attr);
        await handlerInput.attributesManager.savePersistentAttributes();
        const speechText = 'はい。リセットしました。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'このアプリの説明が必要ですか？';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'お疲れ様でした';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `もう一度話していただいてもよろしいですか`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ResetIntentHandler,
        HelpIntentHandler,
        SelectIntentHandler,
        StartIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
     .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter(
            {bucketName:process.env.S3_PERSISTENCE_BUCKET}))
    .lambda();
