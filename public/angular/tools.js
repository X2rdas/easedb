/* 
 * @name arrayEqual
 * @description check if two arrays are equal
 
 * @param {arr} Array to check
 * @param {arr} Array to check
 * @return {Boolean} Boolean, returns true if arrays are the same
 */
 
function arrayEqual(a, b) {
  var i = Math.max(a.length, b.length, 1);
  while(i-- >= 0 && a[i] === b[i]);
  return (i === -2);
}
 
/* 
 * @name flattenArray
 * @description flattens multi-dimension array into one-dimension array
 * useful for manipulating function arguments like flattenArray(arguments)
 * @usage flattenArray(arr)
 * eg. 
 * [1, 2]                => [1, 2]
 * [1, [[[[[[2]]]]]]]    => [1, 2]
 * [1,[2,3],[[[[4]]],5]] => [1, 2, 3, 4, 5]
 *
 * @param {arr} Array to flatten
 * @return {Array} Array, one-dimension array
 */
function flattenArray(arr) {
  var r = [];
  
  while (!arrayEqual(r, arr)) {
    r = arr;
    arr = [].concat.apply([], arr);
  }
  return arr;
}

function getUsersFromJSON(object, url){
  var users = [];
  var allusers = [];
  var arrayfromfloor = [];
  var arrayfromfloor2 = [];
  for (var key in object)
  {
    if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
    {
      arrayfromfloor2 = getUsersFromJSON(object[key], url+key+'/');
      arrayfromfloor = arrayfromfloor.concat(arrayfromfloor2);

    }
    else if (object[key]['type'] == 'user') {
      var obj = {};
      obj[url+key+'/'] = object[key];
      users.push(obj);
    }
  }

  allusers = users.concat(arrayfromfloor);
  return allusers;
}

function getUsersFromJSONForPrint(object){
  var users = [];
  var allusers = [];
  var arrayfromfloor = [];
  var arrayfromfloor2 = [];
  for (var key in object)
  {
    if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
    {
      arrayfromfloor2 = getUsersFromJSONForPrint(object[key]);
      arrayfromfloor = arrayfromfloor.concat(arrayfromfloor2);

    }
    else if (object[key]['type'] == 'user') {
      var obj = {};
      obj[key] = object[key];
      users.push(obj);
    }
  }

  allusers = users.concat(arrayfromfloor);
  return allusers;
}

function getUsersFromJSONForList(object,url){
  var users = [];
  var allusers = [];
  var arrayfromfloor = [];
  var arrayfromfloor2 = [];
  for (var key in object)
  {
    if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
    {
      arrayfromfloor2 = getUsersFromJSONForList(object[key], url+key+'/');
      arrayfromfloor = arrayfromfloor.concat(arrayfromfloor2);

    }
    else if (object[key]['type'] == 'user') {
      // var obj = {};
      // obj[url+key+'/'] = object[key];
      object[key]['id'] = url+key;
      object[key]['parent_name'] = object['name'];
      users.push(object[key]);
    }
  }

  allusers = users.concat(arrayfromfloor);
  return allusers;
}

function getSectionsFromJSONForList(object,url){
  var sections = [];
  var allsections = [];
  var arrayfromfloor = [];
  var arrayfromfloor2 = [];
  for (var key in object)
  {
    if ((typeof object[key] == "object") && (object[key]['type'] != 'user' ) && (object[key]['type'] != 'registration' ) && (object[key]['type'] != 'print' )) 
    {
      var obj = {};
      obj['id'] = url+key;
      obj['name'] = object[key]['name']+' ('+object['name']+')';
      sections.push(obj);
      arrayfromfloor2 = getSectionsFromJSONForList(object[key], url+key+'/');
      arrayfromfloor = arrayfromfloor.concat(arrayfromfloor2);

    }
    // else if (object[key]['type'] == 'user') {
    //   // var obj = {};
    //   // obj[url+key+'/'] = object[key];
      
    // }
  }

  allsections = sections.concat(arrayfromfloor);
  return allsections;
}

function getValuesOfUserFromJSON(value,object) {
  // alert(value);
  var values = [];
  var allvalues = [];
  var arrayfromfloor = [];
  var arrayfromfloor2 = [];
  for (var key in object)
  {
    if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
    {

      arrayfromfloor2 = getValuesOfUserFromJSON(value,object[key]);
      // arrayfromfloor = arrayfromfloor.concat({"name": object['name']});
      arrayfromfloor = arrayfromfloor.concat(arrayfromfloor2);

    }
    else if (object[key]['type'] == 'user') {
      values.push({});  
      for (var i=0; i<value.length; i++) {
        // alert(object[key][value[i]]);
        if (typeof object[key][value[i]] != 'undefined') values[values.length-1][value[i]] = object[key][value[i]];
      }
      // alert(JSON.stringify(values[values.length-1]));
      
    }
  }

  allvalues = values.concat(arrayfromfloor);
  return allvalues.unique();
}

function str_replace(search, replace, subject) {
  return subject.split(search).join(replace);
}

function back(url){
  return url.slice(0, url.lastIndexOf('/'));
}

function getLastEntry(url){
  return url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.lastIndexOf('/'));
}

function inArray(x, arr) {
  for(var i = 0; i < arr.length; i++) {
    if(x === arr[i]) return true;
  }
  return false;
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function translateIt(el)
  {

    new_el = new String();

    A = new Array();
    A["/"] = "_"; A["."] = "_"; A["Ё"]="YO";A["Й"]="I";A["Ц"]="TS";A["У"]="U";A["К"]="K";A["Е"]="E";A["Н"]="N";A["Г"]="G";A["Ш"]="SH";A["Щ"]="SCH";A["З"]="Z";A["Х"]="H";A["Ъ"]="'";
    A["ё"]="yo";A["й"]="i";A["ц"]="ts";A["у"]="u";A["к"]="k";A["е"]="e";A["н"]="n";A["г"]="g";A["ш"]="sh";A["щ"]="sch";A["з"]="z";A["х"]="h";A["ъ"]="'";
    A["Ф"]="F";A["Ы"]="I";A["В"]="V";A["А"]="A";A["П"]="P";A["Р"]="R";A["О"]="O";A["Л"]="L";A["Д"]="D";A["Ж"]="ZH";A["Э"]="E";
    A["ф"]="f";A["ы"]="i";A["в"]="v";A["а"]="a";A["п"]="p";A["р"]="r";A["о"]="o";A["л"]="l";A["д"]="d";A["ж"]="zh";A["э"]="e";
    A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="";A["Б"]="B";A["Ю"]="YU";
    A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="";A["б"]="b";A["ю"]="yu";A[" "] = "_";A["'"] = ""; A['"'] = "";A['ё'] = "e";
    new_el = el.replace(/([\u0410-\u0451]|\/| )/g,

      function (str,p1,offset,s) {

        if (A[str] != 'undefined'){return A[str];}

      }

      );
    return new_el;
  }