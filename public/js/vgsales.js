  $(document).ready(function(){
            generateSales();
            generateData();
    });

    function generateData(){
      var limit = document.getElementById('quantity').value;
      var json = { queryLimit: limit};
                $.ajax({
                  url: '/getData',
                  type: 'post',
                  data: JSON.stringify(json),
                  contentType: "application/json; charset=utf-8",
                  success:function(data){
                    //send to data tab
                    jsonData = JSON.parse(data)

                    fillGenreCounts(jsonData.genreCounts)
                    fillPlatformCounts(jsonData.genrePlatCounts);
                    fillPlatformStackCounts(jsonData.platformStackCounts);
                  },
                  error: function(XMLHttpRequest, textStatus, errorThrown) {
                      alert("Error occurred in request");
                    }
                });
              }

    function fillGenreCounts(data){
      //pie chart of genre counts
      //no separation of platforms, just totals based on query number
      var valLabel = [];
      var valNumber = [];
      Object.keys(data).forEach((item) => {
        valLabel.push(item);
        valNumber.push(data[item]);
      });

      var pieData = [{
        values: valNumber,
        labels: valLabel,
        type: 'pie'
      }];
      var layout = {
        title:'% of each top occuring genre',
        height: 500,
        width: 500
      }
      Plotly.newPlot('genreCountPie', pieData, layout);
    }


    function fillPlatformCounts(data){
      //most commonly occuring genre+platform combos in query
      var s = document.createElement("span");
      s.setAttribute('id', 'genrePlatCountPie');
      var divData = document.getElementById('genreData');
      divData.appendChild(s);

      var valLabel = [];
      var valNumber = [];

      data.forEach((item) => {
        valLabel.push(item[0][0] + ' + ' + item[0][1])
        valNumber.push(item[1])
      });

      var pieData = [{
        values: valNumber,
        labels: valLabel,
        type: 'pie',
        textinfo: "value"
      }];
      var layout = {
        title:'Top 10 occuring platform + genre combinations',
        height: 500,
        width: 500
      }
      Plotly.newPlot('genrePlatCountPie', pieData, layout);
    }


    function fillPlatformStackCounts(dataIn){
      //stack bar graph for genre on each platform
      //ie # of sports, # of racing, # of platforming on wii is one bar
      var prep = {
            x: ['Wii'],
            y: [0],
            name: 'Action',
            type: 'bar'
          }

    var data = [prep];

          Object.keys(dataIn).forEach(function(platform){
            Object.keys(dataIn[platform]).forEach(function(genre){
              var trace = {
                x: [platform],
                y: [dataIn[platform][genre]],
                name: genre,
                type:'bar'
              }
              data.push(trace);
            });
          });

      var layout = {
        title: 'Breakdown of genres within platform',
        showlegend: false,
        barmode: 'stack',
        xaxis: {title: 'Hover to view genre'}
      };
      Plotly.newPlot('genrePlatBar', data, layout);
    }




    function generateSales(){
      var limit = 50;
      var json = { queryLimit: limit};
                $.ajax({
                  url: '/getSales',
                  type: 'get',
                  body: json,
                  success:function(data){
                    //send to sales tab
                    jsonGenre = JSON.parse(data)['genreData'];
                    fillGenreSales(jsonGenre);
                    jsonRegional = JSON.parse(data)['regionalData'];
                    fillRegionalSales(jsonRegional);
                  },
                  error: function(XMLHttpRequest, textStatus, errorThrown) {
                      alert("Error occurred in request");
                    }
                });
              }

function fillGenreSales(json){
  //horizontal bar charts of sales
  var divData = document.getElementById('genreSales');
  divData.innerHTML = "";
  //title added here
  var title = document.createElement("h1");
  title.innerHTML = 'Breakdown of genre sales';
  divData.append(title);
  //description here
  var desc = document.createElement("h3");
  desc.innerHTML = 'Various bar charts broken down by sales in millions and split first by genre, then by genre and platform. <br><br>Use the toolbar to explore each chart, hover to see exact values.';
  divData.append(desc);


  for(var key in json){

    var s = document.createElement("span");
    s.setAttribute('id', key);
    var val = json[key]
    var valX = []
    var valY = []

    for(var i in val){
      valY.push(val[i][0])//plat
      valX.push(val[i][1])//sales
    }

    var data = [{
      type: 'bar',
      x: valX,
      y: valY,
      orientation: 'h'
    }];

    var layout = {
        title: {text:'Genre: ' + key},
        xaxis: { title: { text:'Sales in millions' } },
        yaxis: { title: 'Platforms', dtick:1}
      };

    divData.appendChild(s);

    Plotly.newPlot(key, data, layout);
  }
}

function fillRegionalSales(json){

  var divData = document.getElementById('genreSales');
  divData.append(document.createElement('hr'));
  var desc = document.createElement('h3');
  desc.innerHTML = 'Top combinations of genres and platforms sold within each major region'
  divData.append(desc)
  //top 10 combinations in each region
  //keys are presented at Genre:Platform
  var na = json.NA;

  var valX = [];
  var valY = [];

  Object.keys(na).forEach(function(key){
    valX.push(key)//name
    valY.push(na[key])//value
  });

  var n = document.createElement("span");
  n.setAttribute('id', 'NA');

  var data = [{
    type: 'bar',
    x: valX,
    y: valY,
    orientation: 'v'
  }];

  var layout = {
      title: {text:'NA top combos'},
      xaxis: { title: { text:'Genre: Platform' } },
      yaxis: { title: 'Sales', dtick:0.5}
    };

  divData.append(n);
  Plotly.newPlot('NA', data, layout);


  var eu = json.EU;
  valX = [];
  valY = [];

  Object.keys(eu).forEach(function(key){
    valX.push(key)//name
    valY.push(eu[key])//value
  });

  var e = document.createElement("span");
  e.setAttribute('id', 'EU');

  var data = [{
    type: 'bar',
    x: valX,
    y: valY,
    orientation: 'v'
  }];

  var layout = {
      title: {text:'EU top combos'},
      xaxis: { title: { text:'Genre: Platform' } },
      yaxis: { title: 'Sales', dtick:0.5}
    };

  var divData = document.getElementById('genreSales');
  divData.append(e);
  Plotly.newPlot('EU', data, layout);


  var jp = json.JP;
  valX = [];
  valY = [];

  Object.keys(jp).forEach(function(key){
    valX.push(key)//name
    valY.push(jp[key])//value
  });
  var j = document.createElement("span");
  j.setAttribute('id', 'JP');

  var data = [{
    type: 'bar',
    x: valX,
    y: valY,
    orientation: 'v'
  }];

  var layout = {
      title: {text:'JP top combos'},
      xaxis: { title: { text:'Genre: Platform' } },
      yaxis: { title: 'Sales', dtick:0.5}
    };

  var divData = document.getElementById('genreSales');
  divData.append(j);
  Plotly.newPlot('JP', data, layout);

}



function runPred(){
  var predDiv = document.getElementById('predictionResult');
  predDiv.innerHTML = 'loading data...';

  genre = document.getElementById('predGenre').value;
  platform = document.getElementById('predPlatform').value;
  year = document.getElementById('predYear').value;

  var json = { genre: genre, platform: platform, year: year};

  $.ajax({
    url: '/predictor',
    type: 'post',
    data: JSON.stringify(json),
    contentType: "application/json; charset=utf-8",
    success:function(data){
      fillPredictionData(data)
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        //alert("Error occurred in request");
      }
  });
}

function fillPredictionData(data){
  var predDiv = document.getElementById('predictionResult');

  jsonData = JSON.parse(data);

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  var sales = jsonData.predictedSales;
  sales = sales * 1000000; //convert to millions
  sales = formatter.format(sales);

  var avg = jsonData.averageSales;
  avg = avg * 1000000; //convert to millions
  avg = formatter.format(avg);

  predDiv.innerHTML = 'Estimated predicted sales: ' + sales + '<br><br>'+
  'Average past sales for combination: ' + avg;
}


function openGenreSales(evt) {
  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById("genreSales").style.display = "block";
  evt.currentTarget.className += " active";
}

function openGenreData(evt) {
  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById("genreData").style.display = "block";
  evt.currentTarget.className += " active";
}

function openPrediction(evt) {
  tabcontent = document.getElementsByClassName("tabContent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  document.getElementById("prediction").style.display = "block";
  evt.currentTarget.className += " active";
}
