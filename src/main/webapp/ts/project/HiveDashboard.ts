/// <reference path="../lib/google.visualization.d.ts" />
/// <reference path="../lib/jquery.d.ts" />
/// <reference path="../lib/moment.d.ts" />
module Project {

    export class AircraftUtils {

        static typeRegistrantName(typeRegistrant:number){
            var types:{[key:number]:string;};
            types = {1:"Individual",2:"Partnership",3:"Corporation",
                4:"Co-Owned",5:"Government",8:"Non Citizen Corp",9:"Non Citizen Co-Owned"};
            return types[typeRegistrant];
        }
    }

    export class Utils {
        static randomNumber(min:number, max:number) {
            return Math.floor(Math.random() * max) + min;
        }

        static tsvFileToJSON(path: string, callback:Function) {

            var tsv = $.ajax({
                url: path,
                dataType: 'text',
                cache:false
            });
            $.when(tsv).done((tsvText : string) => {
                Project.Utils.tsvJSON(tsvText, callback);
            });


        }

        //var tsv is the TSV file with headers
        static tsvJSON(tsv: string, callback:Function){

        var lines=tsv.split("\n");

        var result = [];

        var headers=lines[0].split("\t");
            console.log('HEADERS',headers)

        for(var i=1;i<lines.length;i++){

            var obj = {};
            var currentline=lines[i].split("\t");

            for(var j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);

        }

        //return result; //JavaScript object
       // var json = JSON.stringify(result); //JSON
            callback(result);
    }


    }

    export class DashboardComponent {
        renderCount:number = 0;
        refreshTime:number;
        id:string;

        chart:any;


        render() {
            this.drawChart();
            this.afterRender();
        }


        afterRender() {
            if (this.renderCount == 0 && this.refreshTime) {
              /*  setInterval((e:JQueryEventObject)=> {
                    this.render()
                }, this.refreshTime);
                */
            }
            this.renderCount++;
        }

        drawChart() {

        }
    }

    export class GoogleChart extends DashboardComponent {

        tsvFilePath:string; //path to tsv file
        header:string[];
        chartOptions:any;
        data:any[];
        stopIterationAtIndex:number = -1;

        addData(json:any) {
          //  this.data.push(json[this.labelColumn],json[this.valueColumn]);
        }
        createChart(options:any) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            this.chart = new google.visualization.PieChart(document.getElementById(this.id));
            this.chart.draw(chartData, options);
        }
        beforeCreateChart() {

        }
        drawChart() {
           this.data = [];
            this.data.push( this.header);

            Project.Utils.tsvFileToJSON(this.tsvFilePath,(tsvJson:any) => {

                $.each(tsvJson,(i:number,json:any) => {
                    if(this.stopIterationAtIndex == -1 || (this.stopIterationAtIndex != -1 && i <=this.stopIterationAtIndex)) {
                        this.addData(json);
                    }
                });
                this.beforeCreateChart();

                console.log('CREATING CHART with ',this,this.data)
              this.createChart(this.chartOptions);

            });

        }


    }


    export class GooglePieChart extends GoogleChart {

        createChart(options:any) {
            var chartData = google.visualization.arrayToDataTable(this.data);

            this.chart = new google.visualization.PieChart(document.getElementById(this.id));
            this.chart.draw(chartData, options);
        }


    }

    export class GoogleBarChart extends GoogleChart {

        createChart(options:any) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            var chart = new google.visualization.BarChart(document.getElementById(this.id));
            chart.draw(chartData, options);

        }


    }

    export class GoogleColumnChart extends GoogleChart {

        createChart(options:any) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            var chart = new google.visualization.ColumnChart(document.getElementById(this.id));
            chart.draw(chartData, options);

        }


    }

    export class GoogleDataTable extends GoogleChart {

        createChart(options:any) {
            var chartData = google.visualization.arrayToDataTable(this.data);
                this.chart = new google.visualization.Table(document.getElementById(this.id));
             this.chart.draw(chartData, {showRowNumber: true, width: '100%', height: '100%'});

        }


    }


    export class TotalsPieChart extends GooglePieChart {

        id ='totals-piechart';
        tsvFilePath = 'bootcamp_data/chart_data_stacked.txt';
        header = ['Aircraft Type','Count'];
        chartOptions = {};
        tmpData:{[key:string]:number;} = {};
        stopIterationAtIndex = 9;

        addData(json:any) {
            var value = 0;
            try {
                value = parseInt(json['WITHOUT']);

            }catch(err){
                value = 0;
            }
            var code  = $.trim(json['MFR'])+"-"+$.trim(json['MODEL']);

            //build 75000
            var build = 75000;
            var sell = 200000;
            var profit = (value*sell) - (value*build);

            code +=' Profit $'+profit.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');;
            if(this.tmpData[code] == undefined){
                this.tmpData[code] = value;
            }
            else {
                this.tmpData[code] += value;
            }
        }

        beforeCreateChart() {

            $.each(this.tmpData,(key:string,value:number) => {
                this.data.push([key,value]);
            })
        }

    }

    export class TotalsTypeChart extends GooglePieChart {

        id ='totals-kind-piechart';
        tsvFilePath = 'bootcamp_data/pie_chart_no_adsb_aft_type.txt';
        header = [ 'Type', 'Count'];
        chartOptions =   {
       chartTitle:this.chartTitle
    };
        tmpData:{[key:string]:number;} = {};

        chartTitle ='Types of Aircraft without ADSB-T';
        addData(json:any) {
            var value = 0;
            try {
                value = parseInt(json['CNT']);

            }catch(err){
                value = 0;
            }
            var typeRegistrant = parseInt($.trim(json['AFT_TYPE']));
            var kindOfAircraft = AircraftUtils.typeRegistrantName(typeRegistrant);
            if(this.tmpData[kindOfAircraft] == undefined){
                this.tmpData[kindOfAircraft] = value;
            }
            else {
                this.tmpData[kindOfAircraft] += value;
            }

        }

        beforeCreateChart() {

            $.each(this.tmpData,(key:string,value:number) => {
                this.data.push([key,value]);
            })
        }

    }

    export class FlightDayData extends GoogleColumnChart {
        id ='flight-day-barchart';
        tsvFilePath = 'bootcamp_data/flight_day_traffic.txt';
        header = [ 'Day', 'Count'];
        chartOptions =   {
            width: 700,
            height: 600,
            legend: { position: 'top', maxLines: 3 },
            hAxis: {
                title: 'Day of Week'
            },
            vAxis: {
                title: '# of Flights'
            }
        };

        addData(json:any) {
            var code  = $.trim(json['DAY']);
            this.data.push([code,parseInt(json['COUNT'])]);
        }

        beforeCreateChart() {
            console.log('data',this.data)
        }
    }

    export class CurrentMarket extends GoogleBarChart {
        id ='current-mkt-barchart';
        tsvFilePath = 'bootcamp_data/chart_data_stacked.txt';
        header = [ 'Aircraft', 'With ADSB','Without ADSB'];
        chartOptions =   {
            width: 700,
            height: 600,
            legend: { position: 'top', maxLines: 3 },
            bar: { groupWidth: '75%' },
            isStacked: true,
            hAxis: {
                title: '# of Aircrafts'
            }
        };
        stopIterationAtIndex = 9;

        addData(json:any) {
            var code  = $.trim(json['MFR'])+"-"+$.trim(json['MODEL']);
            this.data.push([code,parseInt(json['WITH']), parseInt(json['WITHOUT'])]);
        }


    }

    export class OwnerPieChart extends GoogleBarChart {
//MFR_MODEL_CODE	MFR	MODEL	NAME	TYPE_REGISTRANT	WITH_ADSB
        id ='top-owner-piechart';
        tsvFilePath = 'bootcamp_data/metrics_table.txt';
        header = [ 'Owner','Count'];
        chartOptions =   {
        };

        tmpData:{[key:string]:{[key:string]:number;};} = {};

        addData(json:any) {
            var code  = $.trim(json['MFR_MODEL_CODE']);
            var mfr = $.trim(json['MFR']);
            var model = $.trim(json['MODEL']);
            var name = $.trim(json['NAME']);
            var type = parseInt($.trim(json['TYPE_REGISTRANT']));
            var hasAdsb = parseInt($.trim(json['WITH_ADSB']));
            var bHas = false;
            if(hasAdsb == 1){
                bHas = true;
            }
            if(!bHas) {
                if(this.tmpData[name] == undefined) {
                    this.tmpData[name] = 1;
                }
                else {
                    this.tmpData[name] += 1;
                }
            }

        }

        beforeCreateChart() {

            var cnt= 0;
            $.each(this.tmpData,(key:string,value:number) => {
                if(cnt <=9) {
                    this.data.push([key, value]);
                }
                cnt++;
            })
        }




    }

    export class MetricsTable extends GoogleDataTable {
//MFR_MODEL_CODE	MFR	MODEL	NAME	TYPE_REGISTRANT	WITH_ADSB
        id ='current-mkt-table';
        tsvFilePath = 'bootcamp_data/metrics_table.txt';
        header = [ 'Code','Manufacturer','Model','Name','Type','Has ADSB'];
        chartOptions =   {
            chartTitle:'ADSB Data'
        };

        addData(json:any) {
            var code  = $.trim(json['MFR_MODEL_CODE']);
            var mfr = $.trim(json['MFR']);
            var model = $.trim(json['MODEL']);
            var name = $.trim(json['NAME']);
            var type = parseInt($.trim(json['TYPE_REGISTRANT']));
            var hasAdsb = parseInt($.trim(json['WITH_ADSB']));
            var bHas = false;
    if(hasAdsb == 1){
        bHas = true;
    }
            var kindOfAircraft = AircraftUtils.typeRegistrantName(type);
            this.data.push([code,mfr,model,name,kindOfAircraft,bHas]);
        }




    }
    export class FlightDashboard {

        load() {
            google.load("visualization", "1", {packages: ["corechart","gauge","line","table"]});
            google.setOnLoadCallback(()=> {
                this.loadCharts();
            });
        }

        loadCharts() {
        
            new TotalsPieChart().render();
            new TotalsTypeChart().render();
            new CurrentMarket().render();
            new MetricsTable().render();
            new FlightDayData().render();
           // new OwnerPieChart().render();
        }

        bindEvents() {

        }
    }
}