
const APP = {
   //global variables:
   HOME_DIV:document.getElementById('Home_div'),
   LIVE_DIV:document.getElementById('chartContainer_div'),
   ABOUT_DIV:document.getElementById('about_div'),
   PROGRESS_SCREEN: document.getElementById('progress_s'),
   collapsedCard: undefined,

   //ganeric functions:
   CALL_ERROR:function(){
     APP.PROGRESS_SCREEN.innerHTML += `<h1>Not Found</h1>`
     setTimeout(function(){
         APP.PROGRESS_SCREEN.className = 'd-none';
     },2000);
    },
   
   AJAX:function(url,handleData){
    if(liveReport.secondsCount == 0){
      APP.PROGRESS_SCREEN.className = 'd-flex';
    }
  $.ajax({url: url, success: function(result){
    APP.PROGRESS_SCREEN.className = 'd-none';
    handleData(result);
  },error: function(){
    APP.CALL_ERROR();
  }});
  }
}

const TEMPLATES = {
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
           <p>USD: $ ${USD}</p>
           <p>EUR: € ${EUR}</p>
           <p>ILS: ₪ ${ILS}</p>
         </div>`;
    },
    INSIDE_REMOVE_SCREEN: function(coin){
      return `<p class="border rounded p-2">
             ${coin}
              <i class="fas fa-times-circle"  onClick="liveReport.deleteFromLive(this)" data-symbol="${coin}"></i>
              </p>`
    },
    CHART_EMPTY:`
       <div class="card-header">
           Live Report
       </div>
       <div class="card-body">
         <h1 class="card-title">Nothing in live</h1>
         <h5 class="card-title">Please select coins</h5>
       </div>`
}

function handleAllCoins(data){
  APP.HOME_DIV.style.display = 'flex';
   for(i in data){
       if(i <= 100){
       $(APP.HOME_DIV).append(TEMPLATES.COIN_TEMPLATE(data[i].symbol,data[i].name,data[i].id));
      }
  }
  APP.PROGRESS_SCREEN.className = 'd-none';
}

function handleMoreInfo(data){
  $(APP.collapsedCard).append(TEMPLATES.COLLAPSE_TEMPLATE(data.image.small,data.market_data.current_price.usd,data.market_data.current_price.eur,data.market_data.current_price.ils));
  APP.PROGRESS_SCREEN.className = 'd-none';
}

function openMoreInfo(that){
     APP.collapsedCard = that.parentElement.parentElement;
     const THIS_PARENT = APP.collapsedCard; 
     const PARENT_ID = THIS_PARENT.getAttribute('data-id');
     const clicked = that.getAttribute('data-click');
     let $clickTime =  $(THIS_PARENT).attr('data-time');
     let now = new Date().getTime();
     let difference =  now % $clickTime /1000;

    if(clicked == 'no'){
        if($clickTime == undefined || difference > 120){
            $(THIS_PARENT).find('.myCollapse').remove();
            
            APP.AJAX(`https://api.coingecko.com/api/v3/coins/${PARENT_ID}`,handleMoreInfo);
            $(THIS_PARENT).attr('data-time',`${new Date().getTime()}`);
          
          }else if(difference <= 120){
              $(THIS_PARENT).find('.myCollapse').css('display','block');
          }
          $(that).attr('data-click','yes')
    }else if(clicked == 'yes'){
        $(THIS_PARENT).find('.myCollapse').css('display','none')
        $(that).attr('data-click','no');
    }
 }

 const NAV_BAR = {
    navBtns:function(target){
      $('.contant_divs').css('display','none');
      $(`#${target.id}_div`).css('display','block');
      clearInterval(liveReport.chartInterval)
      $("#chartContainer_div").html('');
      liveReport.secondsCount = 0;
      $(`.card-parent`).attr('class','card-parent ml-2 mr-2');
      if(target.id == 'chartContainer'){
       startLive();
      }else if(target.id == 'Home'){
       $(`#${target.id}_div`).css('display','flex');
      }
    },
    search: //search / filter: 
    $('#search_btn').on('click',function(){
      let $val = $('#search_input').val().toLowerCase();
      let allCardsCoins = document.getElementsByClassName('card-parent');
      let $itsClass = $(`.card-parent[data-symbol-parent='${$val}']`).attr('class');
     if($itsClass != undefined || $val == "selected-items"){
      $('#Home').click();
      for(i = 0; i < allCardsCoins.length; i++){
          allCardsCoins[i].classList = "card-parent ml-2 mr-2 d-none";
      }
      if($val == "selected-items"){
        for(i in liveReport.itemsInLive){
          $(`.card-parent[data-symbol-parent='${(liveReport.itemsInLive[i]).toLowerCase()}']`).attr('class','card-parent ml-2 mr-2');
        }
      }else{
          $(`.card-parent[data-symbol-parent='${$val}']`).attr('class','card-parent ml-2 mr-2');
      }
     }
      
    })
 }

let liveReport = {
    itemsInLive: [],
    secondsCount: 0,
    chartInterval: '',
    XYArr: [],
    MAX_IN_LIVE: 5,

    CHOISE_SCREEN: document.getElementById('choice_s'),
    CARD_BODY: document.getElementById('list_to_remove'),

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
            $(liveReport.CARD_BODY).append(TEMPLATES.INSIDE_REMOVE_SCREEN(coin));
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
        let dataSymbol = that.getAttribute('data-symbol');
        let toRemove = document.querySelector(`input[data-symbol='${dataSymbol.toLowerCase()}']`);
        toRemove.click();
        let waiting = document.querySelector('.waitingToPush')
        waiting.removeAttribute('class');
        waiting.click();
        liveReport.closeScreen();
    },
}
 
function startLive(){
    liveReport.XYArr = [];
    if( liveReport.itemsInLive.length > 0 && liveReport.secondsCount == 0){
        for(i of liveReport.itemsInLive){
          liveReport.XYArr.push([]);
         }
         if(liveReport.secondsCount == 0){
            APP.PROGRESS_SCREEN.className = 'd-flex';
        }
        APP.LIVE_DIV.style.display = 'block';
         liveReport.chartInterval = setInterval(() => {
            liveReport.secondsCount += 2;
            let items = '';
            for(i of liveReport.itemsInLive){
                items+= `${i},`
            }
           APP.AJAX(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${items}&tsyms=USD`,startChart);
        }, 2000);
    }else{
        $("#chartContainer_div").append(TEMPLATES.CHART_EMPTY);
    }  
 }

function startChart(result) {
     XYArr = liveReport.XYArr;
     let resultValues = Object.values(result);
     let resultKeys = Object.keys(result);
     let j = 0;
     for(i=0; i <= liveReport.itemsInLive.length-1; i++){
        if(resultKeys.includes(`${liveReport.itemsInLive[i]}`)){
           XYArr[i].push({ x: liveReport.secondsCount, y: resultValues[j].USD });
           j++;
        }else if(liveReport.secondsCount < 5){
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
        let a = {
            type: "spline",
            name: liveReport.itemsInLive[i],
            showInLegend: true,
            dataPoints: XYArr[i]
            };
        options.data.push(a);
     }     
      $("#chartContainer_div").CanvasJSChart(options); 
      let $chart =  $("#chartContainer_div").CanvasJSChart();
      $chart.render()
      function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.$chart.render();
      }
}

//Starting the page:
APP.AJAX("https://api.coingecko.com/api/v3/coins/list",handleAllCoins);