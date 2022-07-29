/**
 * Utilities method
 */


function log(t){
    if( typeof t === 'string'){
        console.log('[LG] ' + t);
    }else{
        console.log(t);
    }

}
function space(){
    console.log(' ');
}

module.exports.log = log;
module.exports.space = space;