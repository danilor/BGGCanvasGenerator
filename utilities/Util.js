function chunk (arr, size){
    const res = [];
    for(let i = 0; i < arr.length; i++) {
        if(i % size === 0){
            res.push([arr[i]]);
        }
        else{
            res[res.length-1].push(arr[i]);
        };
    };
    return res;
};

module.exports.chunk = chunk;