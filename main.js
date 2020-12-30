const Twit = require('twit')
const config = require("./config")
const T = new Twit(config)
const  fs = require("fs")
//comandos
//@botquierodecir -> enviar frase de animo a ti mismo. Mismo tweet
//@botquierodecir añadir {añadir frase} -> añadir frase al json
//@botquierodecir @otrouser -> enviar frase de animo a un usuario

let username = "@botquierodecir"


let stream = T.stream('statuses/filter', { track: [username] });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet){
    let content = tweet.text.split(' ');
   if(content.includes('añadir')){
    let frase = tweet.text.split('añadir').slice(1);
        console.log(frase)
       if(frase.length == 1){
           frase = frase[0].trim();
           if(frase.length > 0){
                addFrase(frase, tweet);
           }else{
                formatoIncorrecto(tweet);
           }
       }else{
           formatoIncorrecto(tweet);
       }
   }else if(content.length == 2){
    if(content[0].indexOf("@") !== -1){
         sendFrase(false,content[1])
    }else{
        formatoIncorrecto(tweet);
    }
   }else if(content.length == 1){
         sendFrase(true,tweet)
   }
    
}

function formatoIncorrecto(tweet, type = null){

    let status = (type !== null) ? 
    (type !== 'duplicado') ? "No te preocupes, yo lo soluciono!" : "Vaya... Está en nuestros registros!, prueba con otra"
    : "Al parecer el formato no es el correcto!";

    T.post('statuses/update', { 
        status: `@${tweet.user.screen_name + " " + status} `,
        in_reply_to_status_id: tweet.id_str
    })
}

function addFrase(frase, tweet){
    let rawdata = fs.readFileSync('frases.json');
    let rawdata1 = fs.readFileSync('frasesPorAprobar.json');
    let frases = JSON.parse(rawdata);
    let frasesPorAprobar = JSON.parse(rawdata1);

    if(!frases.includes(frase) && !frasesPorAprobar.includes(frase)){
        frasesPorAprobar.push(frase)
        fs.writeFile('./frasesPorAprobar.json', JSON.stringify(frasesPorAprobar), function(err){
            if(!err){
                T.post('statuses/update', { 
                    status: `@${tweet.user.screen_name} Gracias por contribuir, se ha añadido con éxito! `,
                    in_reply_to_status_id: tweet.id_str
                })
            }
        });
    }else{
        formatoIncorrecto(tweet, 'duplicado');
    }

   
}
function sendFrase(autoenviar, tweet){
    let rawdata = fs.readFileSync('frases.json');
    let frases = JSON.parse(rawdata);
    let frase = frases[Math.round(Math.random() * ((frases.length-1) - 0))];
    console.log(frase);
    if(autoenviar){
        T.post('statuses/update', { 
            status: `@${tweet.user.screen_name + " " + frase}  `,
            in_reply_to_status_id: tweet.id_str
        })
    }else{
        T.post('statuses/update', { 
            status: `${tweet + " " + frase} `,
        })
    }
}
