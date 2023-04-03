

/* ********* QLCPlus Functions ************************************************************************************* */

// the WebSocket instance
var websocket;
var connectCallback;
var isConnected = false;
var widgetList = []
// the websocket host location
var wshost = "http://127.0.0.1:9999";

var functionCallback;
var functionQLCp = [];
var functionCnt = 0;
var functionMaxId = 0;

var getFunctionTypeCnt = 0;

// init "OnClickEvent" for all buttons with class qlcpButton
document.addEventListener("click", function(element){
  const target = element.target.closest(".qlcpButton");
  if(target) { 
      [objID, status] = target.value.split(',');
      if (Number(objID)) {
        if (!Number(status)) { status = '1'; }
        setFunctionStatusWithID(objID, status)
      }
      else {
    	alert("No valid Parameter ("+target.value+")");
      }
      
  }
});


// sort from: https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value 
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}



// helper function to send QLC+ API commands
function requestAPI(cmd) 
{
  if (isConnected == true)
    websocket.send("QLC+API|" + cmd);
  else
    alert("You must connect to QLC+ WebSocket first !");
}

// helper function to send a QLC+ API with one parameter.
// The specified parameter is not a value, but a CSS object
// from which a value is retrieved (usually a <input> box)
function requestAPIWithParam(cmd, paramObjName) 
{
  var obj = document.getElementById(paramObjName);
  if (obj)
  {
    if (isConnected == true)
      websocket.send("QLC+API|" + cmd + "|" + obj.value);
    else
      alert("You must connect to QLC+ WebSocket first !");
  }
}

function requestAPIWith2Params(cmd, paramObjName, param2ObjName)
{
  var obj1 = document.getElementById(paramObjName);
  var obj2 = document.getElementById(param2ObjName);
  if (obj1 && obj2)
  {
    if (isConnected === true)
      websocket.send("QLC+API|" + cmd + "|" + obj1.value + "|" + obj2.value);
    else
      alert("You must connect to QLC+ WebSocket first!");
  }
}



function getAPIWithParam(cmd, param) 
{
  if (isConnected == true)
    websocket.send("QLC+API|" + cmd + "|" + param);
  else
    alert("You must connect to QLC+ WebSocket first !");
}


function setFunctionStatusWithID(objID, status)
{
  var cmd = 'setFunctionStatus';
  if (isConnected === true) {
    if (functionCnt === 0) {
      alert("You must read Funtion List first!");
    }
    else{
      
      if (status === '0' || status === '1') {
        websocket.send("QLC+API|" + cmd + "|" + objID + "|" + status);
      }
      else if (status === '2') {
        websocket.send("QLC+API|" + cmd + "|" + objID + "|" + "1");
        setTimeout(setFunctionStatusTimer, 100, cmd, objID, "0" );
      }
    }
  }
  else {
      alert("You must connect to QLC+ WebSocket first!");
  }
}

/*
  Beispiel:
   <div class="apiButton" onclick="javascript:setFunctionStatusWithName('Audio 99 SchrTest on', '1');">setFunctionStatusWithName('Audio 99 SchrTest on','1')</div><br>
   <div class="apiButton" onclick="javascript:setFunctionStatusWithName('Audio 99 SchrTest off', '1');">setFunctionStatusWithName('Audio 99 SchrTest off','1')</div><br>
   <div class="apiButton" onclick="javascript:setFunctionStatusWithName('Audio A03 100%', '2');">setFunctionStatusWithName('Audio A03 100%','2')</div><br>
*/
/* status 0=stop, 1=run, 2=flash */
function setFunctionStatusWithName(name, status)
{
  var cmd = 'setFunctionStatus';
  var objID = ''
  if (isConnected === true) {
    if (functionCnt === 0) {
      alert("You must read Funtion List first!");
    }
    else{
      for (i = 0; i < functionCnt; i+=1) {
        if (functionName[i].includes(name)) {
          if (objID === '') {
            objID = functionQLCp[i].id;
          }
          else {
            alert("Name \"" + name + "\" not unique!");
          }
        }
      }
      if (objID === '') {
        alert("Name \"" + name + "\" not found!");
      }
      if (status === '0' || status === '1') {
        websocket.send("QLC+API|" + cmd + "|" + objID + "|" + status);
        //alert("QLC+API|" + cmd + "|" + objID + "|" + status);
      }
      else if (status === '2') {
        websocket.send("QLC+API|" + cmd + "|" + objID + "|" + "1");
        setTimeout(setFunctionStatusTimer, 100, cmd, objID, "0" );
      }
    }
  }
  else {
      alert("You must connect to QLC+ WebSocket first!");
  }
}

function setFunctionStatusTimer(cmd, objID, status) {
  websocket.send("QLC+API|" + cmd + "|" + objID + "|" + status);
}


function getQLCpFunctionList(callback) {
  functionCallback = callback;  
  //requestAPI('getWidgetsList');
  // Atomaticaly read Widget list [RK]
  requestAPI('getFunctionsList');
}

function connectQLCpWebSocket(host, callback) {
  var url = 'ws://' + host + '/qlcplusWS';
  websocket = new WebSocket(url);
  // update the host information
  wshost = "http://" + host;
  connectCallback = callback;

  websocket.onopen = function(ev) {
    //alert("QLC+ connection successful");
    isConnected = true;
    connectCallback('onopen');
  };

  websocket.onclose = function(ev) {
    connectCallback('onclose');
    //alert("QLC+ connection lost !");
  };

  websocket.onerror = function(ev) {
    connectCallback('onerror');
    //alert("QLC+ connection error!");
  };
 
  // WebSocket message handler. This is where async events
  // will be shown or processed as needed
  websocket.onmessage = function(ev) {
    // Uncomment the following line to display the received message
    //alert(ev.data);

    // Event data is formatted as follows: "QLC+API|API name|arguments"
    // Arguments vary depending on the API called

    var msgParams = ev.data.split('|');
    
    if (msgParams[0] == "QLC+API")
    {
      //alert(ev.data);
      // Arguments is an array formatted as follows: 
      // Function ID|Function name|Function ID|Function name|...
      if (msgParams[1] == "getFunctionsNumber") {
	//document.getElementById('getFunctionsNumberBox').innerHTML = msgParams[2];
      }
      else if (msgParams[1] == "getFunctionsList")
      {
        functionQLCp = [];
        functionCnt = 0;
        for (i = 2; i < msgParams.length; i+=2)
        {
            let id = parseInt(msgParams[i]);
            functionQLCp[functionCnt] = {id: '', name: '', type: ''};
            functionQLCp[functionCnt].id = id.toString(); 
            functionQLCp[functionCnt].name = msgParams[i + 1]; 
            if (functionMaxId < id) { functionMaxId = id; }
            functionCnt += 1;
        }
        
        if (functionCnt > 0) {
          getFunctionTypeCnt = functionCnt;
          getAPIWithParam('getFunctionType', functionQLCp[getFunctionTypeCnt-1].id);
        }
        else {
          functionCallback();
        }
      }
      else if (msgParams[1] == "getFunctionType") {
        if (getFunctionTypeCnt > 0) {
          functionQLCp[getFunctionTypeCnt-1].type = msgParams[2];
          
          getFunctionTypeCnt -= 1;
          if ( getFunctionTypeCnt > 0) {
            getAPIWithParam('getFunctionType', functionQLCp[getFunctionTypeCnt-1].id);
          }
          else {
            // setFunctionStatusWithID('2','1')  
            
            // no more elements, mark the Sequence Scene
            for (i = 0; i < (functionCnt-1); i+=1) {
              if (functionQLCp[i+1].type === 'Sequence' && functionQLCp[i].type === 'Scene') {
                functionQLCp[i].type = 'SequenceScene';
              }
            }
            functionQLCp.sort(dynamicSortMultiple("type", "name"));
            functionCallback();
          }
        }
      }
      else if (msgParams[1] == "getFunctionStatus")
      {
        // nothing to do here
      }    
    }
  };
};


/* ********* Textbook Functions ************************************************************************************* */

function updateTextBookInfo(textElementID) {
  /* Return Information within:
  /   - h1infoID, h2infoID, h3infoID, h4infoID, h5infoID, h6infoID: innerText  = text of hx-Tag in scope
  /   - scrollProgressBarID: style.width = scroll bar 0..100%
  */
  //let element = document.getElementById(textElementID);
  let element = document.querySelector(textElementID);     
  
  let position = element.scrollTop;
  let height = element.scrollHeight - element.clientHeight;
  let scrolled = (position / height) * 100;
  document.getElementById("scrollProgressBarID").style.width = scrolled + "%";
  //alert(textElementID + " / " + element + " / " + element.scrollTop+ " / " + element.scrollHeight+ " / " + element.clientHeight);
  
  // Show Tag-text when it reaches the top of visible area (e.g. headings)
  let tags = ['h4', 'h3', 'h2', 'h1'];
  let offset = element.getBoundingClientRect().top;
  let elementText = '';
  
  //console.log('----------------- ' + textElementID)
  
  var c = document.getElementById("scrollBarCanvasID");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.clearRect(0, 0, 10050, 4);
  
  tags.forEach(function(tag) {
    let text = ''
    Array.from(element.getElementsByTagName(tag)).forEach(function(elem, index) {
      //a4[index] = elem.getBoundingClientRect().top - offset;
      elementText = elem.innerText.trim();
      let elementPosition = elem.getBoundingClientRect().top;
      if (index === 0 || (elementPosition - offset) <= 0) { text = elementText;}
      //let canvasPos = ((elementPosition + position - offset) / element.scrollHeight) * 10000;
      let canvasPos = ((elementPosition + position - offset) / height) * 10000;
      
      //console.log(tag + ' ' + index + ' Pos:' + canvasPos);
      //console.log(elem);
      
      if (tag === 'h2') { 
        ctx.fillStyle = $('h2').css('color');
        ctx.fillRect(canvasPos, 0, 50, 4);
      }
      else if (tag === 'h3') {
        ctx.fillStyle = $('h3').css('color');
        ctx.fillRect(canvasPos, 0, 20, 4);
      }
    });
    document.getElementById(tag+'infoID').innerText = text;
  });

  // Show Tag-text until it came up from the bottom of visible area (e.g. page numbers)
  tags = ['h5', 'h6'];
  offset = element.getBoundingClientRect().bottom;
  let a1 = '';
  elementText = '';
  tags.forEach(function(tag) {
    let text = ''
    Array.from(element.getElementsByTagName(tag)).forEach(function(elem) {
      elementText = elem.innerText.trim();
      if (text === '' && (elem.getBoundingClientRect().top - offset) >= 0) {text = elementText;}
    });
    if (text === '') {text = elementText;}
    document.getElementById(tag+'infoID').innerText = text;
  });
}

function updateTextBookIndex(textElementID) {
  //let element = document.getElementById(textElementID);
  let element = document.querySelector(textElementID);
  let indexlist = [];
  let index=0;
  
  let tags = ['h1', 'h2', 'h3', 'h4'];
  //element.scrollTop = 0;
  let position = element.scrollTop;
  let offset = position - element.getBoundingClientRect().top;
  
  tags.forEach(function(tag) {
    Array.from(document.getElementsByTagName(tag)).forEach(function(elem) {
      indexlist[index] = {pos: 0, name: '', tag:''};
      indexlist[index].pos = elem.getBoundingClientRect().top + offset;
      indexlist[index].name = elem.innerText.trim();
      indexlist[index].tag = tag;
      //console.log("element " + index + " / " + indexlist[index].name + ' / ' + indexlist[index].pos);
      index++;
      //text += tag + ' : ' + position + ' = ' + elem.innerText + '<br>';
      //text += '<div width=100% onclick="document.getElementById(\''+textElementID+'\').scrollTop='+ position +';">' + elem.innerText + '</div>';
    });
  });
  
  indexlist[index] = {pos: 0, name: '', tag:''};
  indexlist[index].pos = Number.MAX_VALUE;

  indexlist.sort(dynamicSortMultiple("pos", "tag"));
  
  let text = '';
  if (index) {
    let positionFlag = false;
    indexlist.forEach(function(item, idx) {
      viewClass = 'sidebarIndex';  
      if (!positionFlag && indexlist[idx + 1].pos >= position) {
        positionFlag = true;  
        viewClass = 'sidebarIndexInView';
      }
      text += '<div class="'+ item.tag +'index '+ viewClass +'" width=100% onclick="document.querySelector(\''+textElementID+'\').scrollTop='+ item.pos +';">' + item.name + '</div>';
    });
  }
  
  document.getElementById('textbookID').innerHTML = text;
}
