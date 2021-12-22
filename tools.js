
/// 日志中添加日期和TAG
function addDateConsoleArgument(tag, argumentsArray){
    // var dateStr = dateFormat("YYYY-mm-dd HH:MM:SS:sss", new Date());
    // dateStr += ' '+tag
    // var newArguments = [dateStr];
    // for(var i=0; i<argumentsArray.length; i++){
    //     newArguments.push(argumentsArray[i]);
    // }
    // return newArguments;
    return argumentsArray;
}

/// 日志对象
window.Logger = {
    info(){
        console.log.apply(console, addDateConsoleArgument('INFO', arguments));
    },
    error(msg){
        console.error.apply(console, addDateConsoleArgument('ERROR', arguments));
    },
    warn(msg){
        console.warn.apply(console, addDateConsoleArgument('ERROR', arguments));
    }
};

//将连续的页码合并成一个字符串
function combinePageStr(pagesSrc){
    var pages = pagesSrc.map(n=> { return parseInt(n);  });

    var combined = [];

    for(var i=0; i<pages.length; i++){
        var curPage = pages[i];

        //如果当前页是偶数，下一页是奇数，合并两个页
        if(curPage%2 == 0 && pages.length > i+1){
            var nextPage = pages[i+1];
            if(nextPage %2 != 0 && curPage+1 == nextPage){
                //合并
                combined.push(curPage+','+nextPage);
                i+=1;
                continue;
            }
        }
        
        //如果当前页是奇数、偶数，单独设置一页
        combined.push(curPage+'');
    }
    return combined;
}

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString(),          // 秒
        "s+": date.getMilliseconds().toString()      // 毫秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

// 返回一堆点的区域 {x, y, width, height}
function boundingBox(points){
    var minX = 9999999;
    var minY = 9999999;
    var maxX = 0;
    var maxY = 0;
    points.forEach(p => {
        if(p.X < minX){
            minX = p.X;
        }
        if(p.Y < minY){
            minY = p.Y;
        }
        if(p.X > maxX){
            maxX = p.X;
        }
        if(p.Y > maxY){
            maxY = p.Y;
        }
    });
    return {x:minX, y:minY, width:maxX-minX, height: maxY - minY}
}

function alertError(msg, e){
    var message = msg;
    if(e){
        message = msg+(e.errorMsg || e.Msg || e || '')
    }
    Dialog.alert({ message });
}

function alertConfirm(message, cb){
    Dialog.alert({ message }).then(() => {
        if(cb){
            cb();
        }
    });      
}

//时间显示优化（补“0”）
function addZero(fn) {
    return fn < 10 ? "0" + fn : fn
}

function getUserMedia() {
    return navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia || null;
}

function isEmpty(val){
    if(val == null || val == undefined){
        return true;
    }else if(typeof val == 'string'){
        if(val.length === 0){
            return true;
        }
        if(val.trim().length === 0){
            return true;
        }
    }else if(typeof val == 'object'){
        if(val.length && val.length === 0){
            return true;
        }
        if(Object.prototype.isPrototypeOf(val) && Object.keys(val).length === 0){
            return true;
        }
    }
    return false;
}

function points_to_rect(points){
    if (points.length < 4){
        return null;
    }
    return {
        x: points[0].X,
        y: points[0].Y,
        width: points[1].X - points[0].X,
        height: points[2].Y - points[0].Y,
    };
}

function cloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}

function rect_to_points(rect){
    return [
        {X: rect.x, Y:rect.y},
        {X: rect.x+rect.width, Y: rect.y},
        {X: rect.x+rect.width, Y:rect.y+rect.height},
        {X:rect.x, Y:rect.y+rect.height},
    ]
}

function calc_distance(p1, p2){
    return Math.sqrt(((p2.X-p1.X)*(p2.X-p1.X)+(p2.Y-p1.Y)*(p2.Y-p1.Y)));
}

function is_point_in_polygon(polygon, test_point){
    var contains = false;
    if (polygon.length < 4){
        return false;
    }
    var j = polygon.length - 1;
    for (var i=0; i<polygon.length; i++){
        if (polygon[i].Y < test_point.y && polygon[j].Y >= test_point.y || polygon[j].Y < test_point.y && polygon[i].Y >= test_point.y ){
            if (polygon[i].X + (test_point.y - polygon[i].Y) / (polygon[j].Y - polygon[i].Y) * (polygon[j].X - polygon[i].X) < test_point.x){
                contains = !contains;
            }
        }
        j = i;
    }
    return contains;
}

function marks_scale_mul(marks, scale){
    marks.forEach(mark =>{
        mark_scale_mul(mark, scale);
        if (mark.Models){
            mark.Models.forEach(second_mark => {
                mark_scale_mul(second_mark, scale);
                if (second_mark.Models){
                    second_mark.Models.forEach(third_mark => {
                        mark_scale_mul(third_mark, scale);
                    });
                }
            });
        }
    });
}

function marks_scale_div(marks, scale){
    marks.forEach(mark =>{
        mark_scale_div(mark, scale);
        if (mark.Models){
            mark.Models.forEach(second_mark => {
                mark_scale_div(second_mark, scale);
                if (second_mark.Models){
                    second_mark.Models.forEach(third_mark => {
                        mark_scale_div(third_mark, scale);
                    });
                }
            });
        }
    });
}

/// mark的坐标点乘以一个比例
function mark_scale_mul(mark, scale){
    mark.Points.forEach(pt => {
        pt.X = pt.X * scale;
        pt.Y = pt.Y * scale;
    });

    if(mark.Template){
        var tp = mark.Template;
        tp.X = tp.X * scale;
        tp.Y = tp.Y * scale;
        tp.Width = tp.Width * scale;
        tp.Height = tp.Height * scale;   
    }
}

/// mark的坐标点除以一个比例
function mark_scale_div(mark, scale){
    mark.Points.forEach(pt => {
        pt.X = pt.X / scale;
        pt.Y = pt.Y / scale;
    });

    if(mark.Template){
        var tp = mark.Template;
        tp.X = tp.X / scale;
        tp.Y = tp.Y / scale;
        tp.Width = tp.Width / scale;
        tp.Height = tp.Height / scale;
    }
}