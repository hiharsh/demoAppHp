"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
    app.init();
    app.home.show();
});




function TemplateEngine () {
    this.Templates = {};
};

TemplateEngine.prototype.Render = function(template_url, data_url, cb) {
    var templ_engine = this;
    if(this.Templates[template_url]) {
        
        ajax.get({url:data_url, success:function(data){
                //templ_engine.Templates[template_url]["data"] = data;
                cb(RenderTemplate(templ_engine.Templates[template_url], JSON.parse(data) ));
            },
            error: function(s, a) {
                
            }
        });
        
    }
    else {
        
        ajax.get({
            url:template_url,
            success: function(template) {
                templ_engine.Templates[template_url] = template;
                ajax.get({url:data_url, success:function(data){
                        //templ_engine.Templates[template_url]["data"] = data;
                        
                        cb(RenderTemplate(templ_engine.Templates[template_url], JSON.parse(data) ));
                    },
                    error: function(s, a) {
                        
                    }
                });
            },
            error : function(s, a) {
                
            }
        });
    }
}


function RenderTemplate(template, data) {
  var html = "";

  for (var key in data) {
    html += template.replace(/{{image_url}}/g, data[key]["image_url"])
                            .replace(/{{name}}/g, data[key]["name"])
                            .replace(/{{quote}}/g, data[key]["quote"])
                            .replace(/{{birthday}}/g, data[key]["birthday"])
                            .replace(/{{id}}/g, data[key]["id"]);
  }

  return html;
}



/*********************************************
 * 
 * 
 * 
 *********************************************/

var app = {
    templ_engine:"",
    init: function() {
        app.templ_engine = new TemplateEngine();
        var modal = document.getElementById('modal');
        var show_quote = document.getElementById('show_quote');
        var modal_close = document.getElementsByClassName("close")[0];
        var modal_quote_close = document.getElementsByClassName("close")[1];
        
        modal_close.onclick = function() {
            modal.style.display = "none";
            if(document.getElementById("action").value == "home") {
                window.location="/";
            }
            else if(document.getElementById("action").value == "update_list") {
                app.home.update("/data");
            }
        }
        
        
        modal_quote_close.onclick = function() {
            show_quote.style.display = "none";
        }
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if(event.target == modal){
                modal.style.display = "none";
            }
            if(event.target == show_quote) {
                show_quote.style.display="none";
            }
        }
    },
    home: {
        show:function() {
            var home_btn = document.getElementById("home_btn");
            var search_btn = document.getElementById("search_btn");
            home_btn.style.display = "none";
            search_btn.style.display = "inline-block";
            
            
            app.templ_engine.Render("/list_items.html", "/data", function(html) {
                /*var rendered = '<div class="row" style="margin:0 15px;"><div class="col-s12" style="position: relative;">';
                rendered += '<input type="text" onKeyUp="app.home.searchIn(event)" class="search_box"> ' 
                rendered += '<button class="search_button" ><i class="material-icons">search</i></button></div></div>' ;*/
                
                var rendered = '<ul class="listview">'+html +"</ul>";
                rendered += '<button onclick="app.add.show();" type="button" class="fab">+</button>'
                var App = document.getElementById("app");
                App.innerHTML = rendered;
            });
        },
        show_info:function(e, a) {
            console.log(e.target, a);
            
            var modal = document.getElementById('show_quote');
            document.getElementById('modal_img').src = a[3];
            document.getElementById('quote_name').innerHTML = a[0];
            document.getElementById('quote_birthday').innerHTML = a[1];
            document.getElementById('modal_quote').innerHTML = a[2];
            
            document.getElementById('quote_modal_close').onclick=function(){
                modal.style.display="none";
            };
            
            modal.style.display= "block";
        },
        update:function(url) {
            app.templ_engine.Render("/list_items.html", url, function(html) {
                var list_view = document.getElementsByClassName("listview");
                
                list_view[0].innerHTML = html;
            });
        },
        searchIn: function(e) {
            app.home.update("/data?q="+e.target.value)
        },
        del:function(a) {
            var r = confirm("Do you want to Delete?");
            if (r == true) {
                ajax.del({url:"/data/"+a, success:function(data){
                        //templ_engine.Templates[template_url]["data"] = data;
                        
                        var modal = document.getElementById('modal');
                        var modal_msg = document.getElementById('modal_msg');
                        modal_msg.innerHTML = "Quote Deleted Successfully";
                        document.getElementById("action").value = "update_list";
                        modal.style.display= "block";
    
                    },
                    error: function(s, a) {
                        var modal = document.getElementById('modal');
                        var modal_msg = document.getElementById('modal_msg');
                        modal_msg.innerHTML = "Error in Deleting Quote !! ";
                        
                        modal.style.display= "block";
                    }
                });
            } 
            
        }
    },
    
    add: {
        show:function() {
            var home_btn = document.getElementById("home_btn");
            var search_btn = document.getElementById("search_btn");
            var search_box = document.getElementById("search_box");
            home_btn.style.display = "block";
            search_btn.style.display = "none";
            search_box.style.display = "none";
            
            ajax.get({url:"/add.html", success:function(data){
                    //templ_engine.Templates[template_url]["data"] = data;
                    var App = document.getElementById("app");
                    App.innerHTML = data;
                    
                    setTimeout(function() {
                        utils.checkTotalDay();
                        var year = document.getElementsByName("year");
                        year[0].addEventListener("change", function() {
                            console.log("Year changed");
                            utils.checkTotalDay();
                        });
                        
                        var month = document.getElementsByName("month");
                        month[0].addEventListener("change", function() {
                            console.log("month changed");
                            utils.checkTotalDay();
                        });
                    }, 500);
                },
                error: function(s, a) {
                    
                }
            });
        },
        save:function(e) {
            e.preventDefault();
            if( e.target.name.value != "" &&
                e.target.quote.value != "") {
                    
                ajax.post({
                    url:"/data",
                    params: {
                        name:e.target.name.value,
                        quote:e.target.quote.value,
                        birthday:e.target.month.value+" "+e.target.day.value+", " + e.target.year.value,
                        image_url:e.target.image_url.value,
                    },
                    success:function() {
                        var modal = document.getElementById('modal');
                        var modal_msg = document.getElementById('modal_msg');
                        modal_msg.innerHTML = "New Quote Added Successfully";
                        document.getElementById("action").value = "home";
                        modal.style.display= "block";
                    },
                    error: function() {
                        var modal = document.getElementById('modal');
                        var modal_msg = document.getElementById('modal_msg');
                        modal_msg.innerHTML = "Error in creating Quote !! ";
                        
                        modal.style.display= "block";
                    }
                });
            }
            else {
                var modal = document.getElementById('modal');
                var modal_msg = document.getElementById('modal_msg');
                modal_msg.innerHTML = "Some Parameters Missing !!!";
                modal.style.display= "block";
            }
        }
    }
};


var utils = {
    convertToParam : function(params) {
        var urlParams = "";
        for(var i in params) {
            urlParams += i+"="+params[i]+"&";
        }
        // eliminating last char
        return (urlParams.slice(0, urlParams.length-1));
    },
    leapYear : function (year)
    {
      return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    },
    checkTotalDay : function() {
        var year = document.getElementsByName("year")[0].value;
        var month = document.getElementsByName("month")[0].value;
        
        var totalDate = 31;
        if(year !== '' && month !== '') {
            totalDate = new Date(year, utils.getMonthNumber(month), 0).getDate();
        }
        var day = document.getElementsByName("day")[0];
        day.innerHTML = "";
        for(var i = 1; i <= totalDate; i++) {
            
           day.innerHTML += "<option value='"+i+"'>"+i+"</option>";
        }
    },
    getMonthNumber: function(m) {
        var months = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
        return months.indexOf(m)+1;
    },
    toggleSearch: function(e) {
        var search_box = document.getElementById("search_box");
        if(search_box.style.display == "none") {
            search_box.style.display = "block";
        }
        else {
            search_box.style.display = "none";
        }
    }
};

var ajax = {
    createReq : function(args) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            // Return only When XHR response is complete
            if(this.readyState == 4) {
                if (this.status == 200 || 
                    this.status == 201) {
                    args.success && args.success(this.responseText);
                }
                else  {
                    args.error && args.error(this.status, this.responseText);
                }
            }
        };
        return xhr;
    },
    /*************************************************
     * function get()
     * Arguments:
     *  args
     *      args : {
     *          url // server end point 
     *          params // request parameters
     *          success // success callback
     *          error   // error callback
     *      }
     * 
     * ***********************************************/
    get: function(args) {
        if(typeof(args) == "object") {
            if (window.XMLHttpRequest) {
                if(args.url) {
                    var xhr = this.createReq(args);
                    var finalurl = args.url;
                    if(args.params && typeof(args.params) == "object") {
                        var convertedParams = utils.convertToParam(args.params);
                        if(convertedParams.length > 0) {
                            finalurl += "?" + convertedParams;
                        }
                    }
                    xhr.open("GET", finalurl, true);
                    xhr.send();
                }
                else {
                    console.log("Request URL not provided. ");
                }
            }
            else {
                console.log("XMLHttpRequest not supported");
            }
        }
        else {
            console.log("invalid argument");
        }
    },
    
    /*************************************************
     * function post()
     * Arguments:
     *  args
     *      args : {
     *          url // server end point 
     *          params // request parameters
     *          success // success callback
     *          error   // error callback
     *      }
     * 
     * ***********************************************/
    post: function(args) {
        if(typeof(args) == "object") {
            if (window.XMLHttpRequest) {
                if(args.url) {
                    var xhr = this.createReq(args);
                    var finalurl = args.url;
                    var convertedParams;
                    if(args.params && typeof(args.params) == "object") {
                        convertedParams = utils.convertToParam(args.params);
                        
                    }
                    xhr.open("POST", finalurl, true);
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhr.send(convertedParams);
                }
                else {
                    console.log("Request URL not provided. ");
                }
            }
            else {
                console.log("XMLHttpRequest not supported");
            }
        }
        else {
            console.log("invalid argument");
        }
    },
    
    del : function(args) {
        if(typeof(args) == "object") {
            if (window.XMLHttpRequest) {
                if(args.url) {
                    var xhr = this.createReq(args);
                    var finalurl = args.url;
                    var convertedParams;
                    if(args.params && typeof(args.params) == "object") {
                        convertedParams = utils.convertToParam(args.params);
                    }
                    xhr.open("DELETE", finalurl, true);
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhr.send(convertedParams);
                }
                else {
                    console.log("Request URL not provided. ");
                }
            }
            else {
                console.log("XMLHttpRequest not supported");
            }
        }
        else {
            console.log("invalid argument");
        }
    }
};