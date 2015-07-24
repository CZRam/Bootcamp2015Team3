var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../lib/google.visualization.d.ts" />
/// <reference path="../lib/jquery.d.ts" />
/// <reference path="../lib/moment.d.ts" />
var Project;
(function (Project) {
    var AircraftUtils = (function () {
        function AircraftUtils() {
        }
        AircraftUtils.typeRegistrantName = function (typeRegistrant) {
            var types;
            types = { 1: "Individual", 2: "Partnership", 3: "Corporation", 4: "Co-Owned", 5: "Government", 8: "Non Citizen Corp", 9: "Non Citizen Co-Owned" };
            return types[typeRegistrant];
        };
        return AircraftUtils;
    })();
    Project.AircraftUtils = AircraftUtils;
    var Utils = (function () {
        function Utils() {
        }
        Utils.randomNumber = function (min, max) {
            return Math.floor(Math.random() * max) + min;
        };
        Utils.tsvFileToJSON = function (path, callback) {
            var tsv = $.ajax({
                url: path,
                dataType: 'text',
                cache: false
            });
            $.when(tsv).done(function (tsvText) {
                Project.Utils.tsvJSON(tsvText, callback);
            });
        };
        //var tsv is the TSV file with headers
        Utils.tsvJSON = function (tsv, callback) {
            var lines = tsv.split("\n");
            var result = [];
            var headers = lines[0].split("\t");
            console.log('HEADERS', headers);
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                var currentline = lines[i].split("\t");
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }
                result.push(obj);
            }
            //return result; //JavaScript object
            // var json = JSON.stringify(result); //JSON
            callback(result);
        };
        return Utils;
    })();
    Project.Utils = Utils;
    var DashboardComponent = (function () {
        function DashboardComponent() {
            this.renderCount = 0;
        }
        DashboardComponent.prototype.render = function () {
            this.drawChart();
            this.afterRender();
        };
        DashboardComponent.prototype.afterRender = function () {
            if (this.renderCount == 0 && this.refreshTime) {
            }
            this.renderCount++;
        };
        DashboardComponent.prototype.drawChart = function () {
        };
        return DashboardComponent;
    })();
    Project.DashboardComponent = DashboardComponent;
    var GoogleChart = (function (_super) {
        __extends(GoogleChart, _super);
        function GoogleChart() {
            _super.apply(this, arguments);
            this.stopIterationAtIndex = -1;
        }
        GoogleChart.prototype.addData = function (json) {
            //  this.data.push(json[this.labelColumn],json[this.valueColumn]);
        };
        GoogleChart.prototype.createChart = function (options) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            this.chart = new google.visualization.PieChart(document.getElementById(this.id));
            this.chart.draw(chartData, options);
        };
        GoogleChart.prototype.beforeCreateChart = function () {
        };
        GoogleChart.prototype.drawChart = function () {
            var _this = this;
            this.data = [];
            this.data.push(this.header);
            Project.Utils.tsvFileToJSON(this.tsvFilePath, function (tsvJson) {
                $.each(tsvJson, function (i, json) {
                    if (_this.stopIterationAtIndex == -1 || (_this.stopIterationAtIndex != -1 && i <= _this.stopIterationAtIndex)) {
                        _this.addData(json);
                    }
                });
                _this.beforeCreateChart();
                console.log('CREATING CHART with ', _this, _this.data);
                _this.createChart(_this.chartOptions);
            });
        };
        return GoogleChart;
    })(DashboardComponent);
    Project.GoogleChart = GoogleChart;
    var GooglePieChart = (function (_super) {
        __extends(GooglePieChart, _super);
        function GooglePieChart() {
            _super.apply(this, arguments);
        }
        GooglePieChart.prototype.createChart = function (options) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            this.chart = new google.visualization.PieChart(document.getElementById(this.id));
            this.chart.draw(chartData, options);
        };
        return GooglePieChart;
    })(GoogleChart);
    Project.GooglePieChart = GooglePieChart;
    var GoogleBarChart = (function (_super) {
        __extends(GoogleBarChart, _super);
        function GoogleBarChart() {
            _super.apply(this, arguments);
        }
        GoogleBarChart.prototype.createChart = function (options) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            var chart = new google.visualization.BarChart(document.getElementById(this.id));
            chart.draw(chartData, options);
        };
        return GoogleBarChart;
    })(GoogleChart);
    Project.GoogleBarChart = GoogleBarChart;
    var GoogleColumnChart = (function (_super) {
        __extends(GoogleColumnChart, _super);
        function GoogleColumnChart() {
            _super.apply(this, arguments);
        }
        GoogleColumnChart.prototype.createChart = function (options) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            var chart = new google.visualization.ColumnChart(document.getElementById(this.id));
            chart.draw(chartData, options);
        };
        return GoogleColumnChart;
    })(GoogleChart);
    Project.GoogleColumnChart = GoogleColumnChart;
    var GoogleDataTable = (function (_super) {
        __extends(GoogleDataTable, _super);
        function GoogleDataTable() {
            _super.apply(this, arguments);
        }
        GoogleDataTable.prototype.createChart = function (options) {
            var chartData = google.visualization.arrayToDataTable(this.data);
            this.chart = new google.visualization.Table(document.getElementById(this.id));
            this.chart.draw(chartData, { showRowNumber: true, width: '100%', height: '100%' });
        };
        return GoogleDataTable;
    })(GoogleChart);
    Project.GoogleDataTable = GoogleDataTable;
    var TotalsPieChart = (function (_super) {
        __extends(TotalsPieChart, _super);
        function TotalsPieChart() {
            _super.apply(this, arguments);
            this.id = 'totals-piechart';
            this.tsvFilePath = 'bootcamp_data/chart_data_stacked.txt';
            this.header = ['Aircraft Type', 'Count'];
            this.chartOptions = {};
            this.tmpData = {};
            this.stopIterationAtIndex = 9;
        }
        TotalsPieChart.prototype.addData = function (json) {
            var value = 0;
            try {
                value = parseInt(json['WITHOUT']);
            }
            catch (err) {
                value = 0;
            }
            var code = $.trim(json['MFR']) + "-" + $.trim(json['MODEL']);
            //build 75000
            var build = 75000;
            var sell = 200000;
            var profit = (value * sell) - (value * build);
            code += ' Profit $' + profit.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            ;
            if (this.tmpData[code] == undefined) {
                this.tmpData[code] = value;
            }
            else {
                this.tmpData[code] += value;
            }
        };
        TotalsPieChart.prototype.beforeCreateChart = function () {
            var _this = this;
            $.each(this.tmpData, function (key, value) {
                _this.data.push([key, value]);
            });
        };
        return TotalsPieChart;
    })(GooglePieChart);
    Project.TotalsPieChart = TotalsPieChart;
    var TotalsTypeChart = (function (_super) {
        __extends(TotalsTypeChart, _super);
        function TotalsTypeChart() {
            _super.apply(this, arguments);
            this.id = 'totals-kind-piechart';
            this.tsvFilePath = 'bootcamp_data/pie_chart_no_adsb_aft_type.txt';
            this.header = ['Type', 'Count'];
            this.chartOptions = {
                chartTitle: this.chartTitle
            };
            this.tmpData = {};
            this.chartTitle = 'Types of Aircraft without ADSB-T';
        }
        TotalsTypeChart.prototype.addData = function (json) {
            var value = 0;
            try {
                value = parseInt(json['CNT']);
            }
            catch (err) {
                value = 0;
            }
            var typeRegistrant = parseInt($.trim(json['AFT_TYPE']));
            var kindOfAircraft = AircraftUtils.typeRegistrantName(typeRegistrant);
            if (this.tmpData[kindOfAircraft] == undefined) {
                this.tmpData[kindOfAircraft] = value;
            }
            else {
                this.tmpData[kindOfAircraft] += value;
            }
        };
        TotalsTypeChart.prototype.beforeCreateChart = function () {
            var _this = this;
            $.each(this.tmpData, function (key, value) {
                _this.data.push([key, value]);
            });
        };
        return TotalsTypeChart;
    })(GooglePieChart);
    Project.TotalsTypeChart = TotalsTypeChart;
    var FlightDayData = (function (_super) {
        __extends(FlightDayData, _super);
        function FlightDayData() {
            _super.apply(this, arguments);
            this.id = 'flight-day-barchart';
            this.tsvFilePath = 'bootcamp_data/flight_day_traffic.txt';
            this.header = ['Day', 'Count'];
            this.chartOptions = {
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
        }
        FlightDayData.prototype.addData = function (json) {
            var code = $.trim(json['DAY']);
            this.data.push([code, parseInt(json['COUNT'])]);
        };
        FlightDayData.prototype.beforeCreateChart = function () {
            console.log('data', this.data);
        };
        return FlightDayData;
    })(GoogleColumnChart);
    Project.FlightDayData = FlightDayData;
    var CurrentMarket = (function (_super) {
        __extends(CurrentMarket, _super);
        function CurrentMarket() {
            _super.apply(this, arguments);
            this.id = 'current-mkt-barchart';
            this.tsvFilePath = 'bootcamp_data/chart_data_stacked.txt';
            this.header = ['Aircraft', 'With ADSB', 'Without ADSB'];
            this.chartOptions = {
                width: 700,
                height: 600,
                legend: { position: 'top', maxLines: 3 },
                bar: { groupWidth: '75%' },
                isStacked: true,
                hAxis: {
                    title: '# of Aircrafts'
                }
            };
            this.stopIterationAtIndex = 9;
        }
        CurrentMarket.prototype.addData = function (json) {
            var code = $.trim(json['MFR']) + "-" + $.trim(json['MODEL']);
            this.data.push([code, parseInt(json['WITH']), parseInt(json['WITHOUT'])]);
        };
        return CurrentMarket;
    })(GoogleBarChart);
    Project.CurrentMarket = CurrentMarket;
    var OwnerPieChart = (function (_super) {
        __extends(OwnerPieChart, _super);
        function OwnerPieChart() {
            _super.apply(this, arguments);
            //MFR_MODEL_CODE	MFR	MODEL	NAME	TYPE_REGISTRANT	WITH_ADSB
            this.id = 'top-owner-piechart';
            this.tsvFilePath = 'bootcamp_data/metrics_table.txt';
            this.header = ['Owner', 'Count'];
            this.chartOptions = {};
            this.tmpData = {};
        }
        OwnerPieChart.prototype.addData = function (json) {
            var code = $.trim(json['MFR_MODEL_CODE']);
            var mfr = $.trim(json['MFR']);
            var model = $.trim(json['MODEL']);
            var name = $.trim(json['NAME']);
            var type = parseInt($.trim(json['TYPE_REGISTRANT']));
            var hasAdsb = parseInt($.trim(json['WITH_ADSB']));
            var bHas = false;
            if (hasAdsb == 1) {
                bHas = true;
            }
            if (!bHas) {
                if (this.tmpData[name] == undefined) {
                    this.tmpData[name] = 1;
                }
                else {
                    this.tmpData[name] += 1;
                }
            }
        };
        OwnerPieChart.prototype.beforeCreateChart = function () {
            var _this = this;
            var cnt = 0;
            $.each(this.tmpData, function (key, value) {
                if (cnt <= 9) {
                    _this.data.push([key, value]);
                }
                cnt++;
            });
        };
        return OwnerPieChart;
    })(GoogleBarChart);
    Project.OwnerPieChart = OwnerPieChart;
    var MetricsTable = (function (_super) {
        __extends(MetricsTable, _super);
        function MetricsTable() {
            _super.apply(this, arguments);
            //MFR_MODEL_CODE	MFR	MODEL	NAME	TYPE_REGISTRANT	WITH_ADSB
            this.id = 'current-mkt-table';
            this.tsvFilePath = 'bootcamp_data/metrics_table.txt';
            this.header = ['Code', 'Manufacturer', 'Model', 'Name', 'Type', 'Has ADSB'];
            this.chartOptions = {
                chartTitle: 'ADSB Data'
            };
        }
        MetricsTable.prototype.addData = function (json) {
            var code = $.trim(json['MFR_MODEL_CODE']);
            var mfr = $.trim(json['MFR']);
            var model = $.trim(json['MODEL']);
            var name = $.trim(json['NAME']);
            var type = parseInt($.trim(json['TYPE_REGISTRANT']));
            var hasAdsb = parseInt($.trim(json['WITH_ADSB']));
            var bHas = false;
            if (hasAdsb == 1) {
                bHas = true;
            }
            var kindOfAircraft = AircraftUtils.typeRegistrantName(type);
            this.data.push([code, mfr, model, name, kindOfAircraft, bHas]);
        };
        return MetricsTable;
    })(GoogleDataTable);
    Project.MetricsTable = MetricsTable;
    var FlightDashboard = (function () {
        function FlightDashboard() {
        }
        FlightDashboard.prototype.load = function () {
            var _this = this;
            google.load("visualization", "1", { packages: ["corechart", "gauge", "line", "table"] });
            google.setOnLoadCallback(function () {
                _this.loadCharts();
            });
        };
        FlightDashboard.prototype.loadCharts = function () {
            /* new IncomingFlights().render();
             new ServicesRequired().render();
             new Weather().render();
             new TransportationData().render();
             new DailyActivity().render();
             new MaintenanceData().render();
             new ADSBTable().render();
             new SheldonData().render();
             */
            new TotalsPieChart().render();
            new TotalsTypeChart().render();
            new CurrentMarket().render();
            new MetricsTable().render();
            new FlightDayData().render();
            // new OwnerPieChart().render();
        };
        FlightDashboard.prototype.bindEvents = function () {
        };
        return FlightDashboard;
    })();
    Project.FlightDashboard = FlightDashboard;
})(Project || (Project = {}));
/// <reference path="lib/underscore.d.ts" />
/// <reference path="lib/jquery.d.ts" />
/// <reference path="project/HiveDashboard.ts" />
//# sourceMappingURL=Project.js.map