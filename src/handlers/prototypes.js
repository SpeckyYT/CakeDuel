Array.prototype.sincludes = function(s){
    return this.some(v=> typeof v == 'string' ? v.includes(s) : false);
}
