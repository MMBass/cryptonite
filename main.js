var consts = {
  COIN_TEMPLATE: function(symbol,name,Id){
   return `<div class="card-parent ml-2 mr-2" data-symbol-parent="${symbol}">
    <div class="card" data-name="${name}" data-id="${Id}" data-seconds="120">
     <div class="card-body">
       <h5 class="card-title">${symbol}</h5>
       <p class="card-text">${name}</p>
       <a class="btn btn-primary" onclick="openMoreInfo(this)"data-click='no'>More info</a>
       <label class="switch col-1">
          <input class="input" type="checkbox" onClick="liveReport.pushItem(this)" data-symbol='${symbol}'>
          <span class="slider round"></span>
       </label>
      </div>
    </div>
    </div>
   `;

  },
   COLLAPSE_TEMPLATE: function(IMG,USD,EUR,ILS){
        return `<div class="myCollapse">
          <img src='${IMG}' alt="">
          <p>USD:${USD}</p>
          <p>EUR:${EUR}</p>
          <p>ILS:${ILS}</p>
        </div>`;
   },
   HOME_DIV:document.getElementById('Home_div'),
   PROGRESS_SCREEN: document.getElementById('progress_s'),
   LIVE_DIV:document.getElementById('chartContainer'),
   ABOUT_DIV:document.getElementById('about_div'),
   chartInterval:'',
}

let liveReport = {
    itemsInLive: [],
    secondsCount: 0,
    intervalCounter: 0,

    CHOISE_SCREEN: document.getElementById('choice_s'),

    CARD_BODY: document.getElementById('list_to_remove'),

    MAX_IN_LIVE: 5,

    pushItem: function(that){
       if(that.checked == false){

        liveReport.itemsInLive.splice(liveReport.itemsInLive.indexOf(that.getAttribute('data-symbol').toUpperCase()),1);

       }else if(liveReport.itemsInLive.length >= liveReport.MAX_IN_LIVE){
        liveReport.removeScreen(that);
        that.className = "waitingToPush";
       }else{
       liveReport.itemsInLive.push(that.getAttribute('data-symbol').toUpperCase());
      } 
    },
    removeScreen: function(that){
        liveReport.CHOISE_SCREEN.className = 'd-flex';
        for(coin of liveReport.itemsInLive){
            $(liveReport.CARD_BODY).append(`
            <p class="border rounded p-2">
             ${coin}
             <i class="fas fa-times-circle"  onClick="liveReport.deleteFromLive(this)" data-symbol="${coin}"></i>
            </p>`);
            liveReport.cancelBTN(that);
        }
    },
    cancelBTN: function(that){
        const BTN = document.getElementById('cancel_btn');
        that.checked = false;
        BTN.addEventListener('click',liveReport.closeScreen);
    },
    closeScreen: function(){
        liveReport.CARD_BODY.innerHTML = '';
        liveReport.CHOISE_SCREEN.className = 'd-none';
    },
    deleteFromLive: function(that){
        let last = liveReport.itemsInLive[liveReport.itemsInLive.length-1];
        let dataSymbol = that.getAttribute('data-symbol');
        let toRemove = document.querySelector(`input[data-symbol='${dataSymbol.toLowerCase()}']`);
        toRemove.click();
        let waiting = document.querySelector('.waitingToPush')
        waiting.removeAttribute('class');
        waiting.click();
        liveReport.closeScreen();
    },
}

function AjaxCoins(handleData){
    consts.PROGRESS_SCREEN.className = 'd-flex';
  $.ajax({url: "https://api.coingecko.com/api/v3/coins/list", success: function(result){
    handleData(result);
  },error: function(){
    consts.PROGRESS_SCREEN.innerHTML += `<h1>Not Found</h1>`
    setTimeout(function(){
        consts.PROGRESS_SCREEN.className = 'd-none';
    },1000);
  }});
 };

function AjaxAPI(id,handleAPI,card){
  consts.PROGRESS_SCREEN.className = 'd-flex';
  $.ajax({url: `https://api.coingecko.com/api/v3/coins/${id}`,success: function(result){
    handleAPI(result,card);
  },error: function(){
    consts.PROGRESS_SCREEN.innerHTML += `<h1>Not Found</h1>`
    setTimeout(function(){
        consts.PROGRESS_SCREEN.className = 'd-none';
    },2000);
  }});
};

function AjaxLive(callBack,XYArr){
    let items = '';
    for(i of liveReport.itemsInLive){
        items+= `${i},`
    }
    if(liveReport.secondsCount == 0){
        consts.PROGRESS_SCREEN.className = 'd-flex';
    }
    $.ajax({url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${items}&tsyms=USD`,success: function(result){
    consts.PROGRESS_SCREEN.className = 'd-none';
        callBack(result,XYArr);
    },error: function(){
        consts.PROGRESS_SCREEN.innerHTML += `<h1>Not Found</h1>`
        setTimeout(function(){
            consts.PROGRESS_SCREEN.className = 'd-none';
        },2000);
    }});
  };


 function handleData(data){
    consts.HOME_DIV.style.display = 'flex';
     for(i in data){
         if(i <= 100){
         $(consts.HOME_DIV).append(consts.COIN_TEMPLATE(data[i].symbol,data[i].name,data[i].id));
        }
    }
    consts.PROGRESS_SCREEN.className = 'd-none';
 }

 function handleAPI(data,card){
    $(card).append(consts.COLLAPSE_TEMPLATE(data.image.small,data.market_data.current_price.usd,data.market_data.current_price.eur,data.market_data.current_price.ils));
    consts.PROGRESS_SCREEN.className = 'd-none';
 }

 //serch / filter: 
 $('#serch_btn').on('click',function(){
    let val = $('#serch_input').val().toLowerCase();
    let allCardsCoins = document.getElementsByClassName('card-parent');
    let itsClass = $(`.card-parent[data-symbol-parent='${val}']`).attr('class');
   if(itsClass != undefined || val == "selected-items"){
    for(i = 0; i < allCardsCoins.length; i++){
        allCardsCoins[i].classList = "card-parent ml-2 mr-2 d-none";
    }
    if(val == "selected-items"){
      for(i in liveReport.itemsInLive){
        $(`.card-parent[data-symbol-parent='${(liveReport.itemsInLive[i]).toLowerCase()}']`).attr('class','card-parent ml-2 mr-2');
      }
    }else{
        $(`.card-parent[data-symbol-parent='${val}']`).attr('class','card-parent ml-2 mr-2');
    }
   }
    
});

 function openMoreInfo(that){
     const THIS_PARENT = that.parentElement.parentElement;
     const PARENT_ID = THIS_PARENT.getAttribute('data-id');
     const clicked = that.getAttribute('data-click');
     let clickTime =  $(THIS_PARENT).attr('data-time');
     let now = new Date().getTime();
     let difference =  now % clickTime /1000;

    if(clicked == 'no'){
        if(clickTime == undefined || difference > 120){
            $(THIS_PARENT).find('.myCollapse').remove();
            
            AjaxAPI(PARENT_ID,handleAPI,THIS_PARENT);
            $(THIS_PARENT).attr('data-time',`${new Date().getTime()}`);
          
          }else if(difference <= 120){
              $(THIS_PARENT).find('.myCollapse').css('display','flex');
          }
          $(that).attr('data-click','yes')
    }else if(clicked == 'yes'){
        $(THIS_PARENT).find('.myCollapse').css('display','none')
        $(that).attr('data-click','no');
    }
    
 }
 
 // **nav bar can be shorter -
 navBar = {
     homeClick(){
      //reset the chartContainer
      clearInterval(consts.chartInterval)
      $("#chartContainer").html('');
      liveReport.secondsCount = 0;
      console.log('home')
       $('#Home_div').css('display','flex')
       $('#chartContainer').css('display','none')
       $('#About_div').css('display','none')

       $(`.card-parent`).attr('class','card-parent ml-2 mr-2');
     },
     liveReportClick: function(){
         $('#Home_div').css('display','none')
       $('#chartContainer').css('display','block')
       $('#About_div').css('display','none')
        startLive();
     },
     aboutClick: function(){
        //reset the chartContainer
        clearInterval(consts.chartInterval)
        $("#chartContainer").html('');
        liveReport.secondsCount = 0;

        $('#Home_div').css('display','none')
       $('#chartContainer').css('display','none')
       $('#About_div').css('display','block')
     }
 }
 
 
 function startLive(){
     let XYArr = [];
    if( liveReport.itemsInLive.length > 0 && liveReport.secondsCount == 0){
        for(i of liveReport.itemsInLive){
            XYArr.push([]);
         }
        
        consts.LIVE_DIV.style.display = 'block';
        liveReport.intervalCounter = 2000;
         consts.chartInterval = setInterval(() => {
            liveReport.secondsCount++;
          AjaxLive(startChart,XYArr);
        }, 2000);
    }else{
        $("#chartContainer").append(`<div class="card-header">
        Live Report
      </div>
      <div class="card-body">
        <h1 class="card-title">Nothing in live</h1>
        <h5 class="card-title">Please select coins</h5>
        <p>
         </p>
      </div>`)
    }
     
 }
 function startChart(result,XYArr) {
     let resultValues = Object.values(result);
     let resultKeys = Object.keys(result);
     let j = 0;
     for(i=0; i <= liveReport.itemsInLive.length-1; i++){
        if(resultKeys.includes(`${liveReport.itemsInLive[i]}`)){

           XYArr[i].push({ x: liveReport.secondsCount, y: resultValues[j].USD });
           j++;
        }else {
            console.log(`Error: ${liveReport.itemsInLive[i]} has no data in the API, select another`);
        }
    }
     
    var options = {
                
    exportEnabled: true,
    animationEnabled: true,
    title:{
       text: "The Coins in USD"
    },
    subtitles: [{
      text: "Click Legend to Hide or Unhide Data Series"
     }],
    axisX: {
      title: "Coins"
     },
    axisY:{
       title: "USD",             
       titleFontColor: "#4F81BC",             
       lineColor: "#4F81BC",            
       labelFontColor: "#4F81BC",            
       tickColor: "#4F81BC",            
       includeZero: false            
       },
                axisY2: {
                    title: "",
                    titleFontColor: "#C0504E",
                    lineColor: "#C0504E",
                    labelFontColor: "#C0504E",
                    tickColor: "#C0504E",
                    includeZero: false
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries
                },
                data: [{}],
            };
     
     for(i = 0; i<= liveReport.itemsInLive.length; i++){
        let a = JSON.stringify({
            type: "spline",
            name: liveReport.itemsInLive[i],
            showInLegend: true,
            xValueFormatString: "MMM YYYY",
            yValueFormatString: "#,##0 Units",
            dataPoints: XYArr[i]
            });
        options.data.push(JSON.parse(a));
     }     
      $("#chartContainer").CanvasJSChart(options); 
      let chart =  $("#chartContainer").CanvasJSChart();
      chart.render()
      function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
}
 
 AjaxCoins(handleData);
 
