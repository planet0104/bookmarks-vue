
const SelectItemType = {
    None: 0,
    /// 选中了题目级别
    QuestionLevel: 1,
    /// 选中了题干
    QuestionStem: 2,
    /// 选中了小题
    SubQuestionStem: 3,
    /// 选中了答案
    AnswerArea: 4,
    /// 选中了模板匹配区
    AnswerTemplate: 5,
    /// 选中了答案框
    AnswerMark: 6,
}

async function Home(){
    return {
        template: await (await fetch('pages/home.html')).text(),
        data(){
            var self = this;
            return {
                tip_text: "点击选中“A级题目”或“B级题目”后操作",
                items: [],
                combination_type: '1',
                selected_mark: {},
                checked: '1',
                selected_item: [],
                selected_item_id: '',
                selected_item_type: SelectItemType.None,
                canvas_width: 670,
                canvas_height: 947,
                pickers: {
                    bookTypes: { 
                        index: 0,
                        value: '练习册',
                        show: false,
                        items:["练习册","试卷"],
                        onConfirm:(value, index) => {
                            if(self.pickers.bookTypes.value != value){
                                self.pickers.bookTypes.value = value;
                                self.book = index+1;
                                localStorage.setItem("book", self.book+"");
                                //重新加载页面
                                self.loadPage();
                            }
                            self.pickers.bookTypes.show = false;
                        }
                    },
                    bookPapers: {
                        index: 0,
                        value: '选择关联试卷',
                        show: false,
                        items:["选择关联试卷"], onConfirm:(value, index) => {
                            // console.log('选择了关联的试卷:', value, index);
                            if(self.pickers.bookPapers.value != value){
                                self.pickers.bookPapers.value = value;
                                if(index > 0){
                                    self.paper_id = self.papers[index-1].Id;
                                }else{
                                    self.paper_id = '';
                                }
                                localStorage.setItem("paper_id", self.paper_id);
                                //重新加载页面
                                self.loadPage();
                            }
                            self.pickers.bookPapers.show = false;
                        }
                    },
                    grades: {
                        index: 0,
                        value: '一年级', show: false, items:[
                            "一年级","二年级","三年级","四年级","五年级","六年级","七年级","八年级","九年级"
                        ], onConfirm:(value, index) => {
                            if(self.pickers.grades.value != value){
                                self.pickers.grades.value = value;
                                self.grade = index+1;
                                localStorage.setItem("grade", self.grade+"");
                                //重新加载页面
                                self.loadPage();
                            }
                            self.pickers.grades.show = false;
                        }
                    },
                    terms: { 
                        index: 0,
                        value: '一学期', show: false, items:["一学期","二学期"], onConfirm:(value, index) => {
                            if(self.pickers.terms.value != value){
                                self.pickers.terms.value = value;
                                self.term = index+1;
                                localStorage.setItem("term", self.term+"");
                                //重新加载页面
                                self.loadPage();
                            }
                            self.pickers.terms.show = false;
                        }
                    },
                    pageIds: { 
                        index: 0,
                        value: '第1页', show: false, items:["第1页"],
                        onConfirm:(value, index) => {
                            if(self.pickers.pageIds.value != value){
                                self.pickers.pageIds.value = value;
                                self.page = index+1;
                                localStorage.setItem("page", self.page+"");
                                //重新加载页面
                                self.loadPage();
                            }
                            self.pickers.pageIds.show = false;
                        }
                    },
                    chapters: {
                        value: '请选择章节',
                        selectedOptions: [],
                        show: false,
                        options: [],
                        onFinish:({ selectedOptions }) =>{
                            self.pickers.chapters.selectedOptions = selectedOptions;
                            self.chapter_id = selectedOptions[0].value;
                            self.second_chapter_id = selectedOptions[1].value;
                            console.log('已选择章节:', selectedOptions[0], selectedOptions[1]);
                            self.pickers.chapters.value = selectedOptions[0].text +' > '+ selectedOptions[1].text;
                        }
                    },
                    //-------------- 答案选项 ---------
                    answerTypeIdList: { 
                        index: 1,
                        value: '非智能识别',
                        show: false,
                        items:["智能识别","非智能识别"],
                        onConfirm:(value, index) => {
                            if(self.pickers.answerTypeIdList.value != value){
                                self.pickers.answerTypeIdList.value = value;
                                self.get_select_answer_area().Type = index+1;
                            }
                            self.pickers.answerTypeIdList.show = false;
                        }
                    },
                    answerItemTypeIdList:{
                        index: 1,
                        value: '5 填空题',
                        show: false,
                        items:["2 单项选择题","5 填空题","10 多项选择题","11 判断题","23 应用题", "36 主观题", "39 题型"],
                        itemTypeIds:[2, 5, 10, 11, 23, 36, 39],
                        onConfirm:(value, index) => {
                            if(self.pickers.answerItemTypeIdList.value != value){
                                self.pickers.answerItemTypeIdList.value = value;
                                self.get_select_answer_area().ItemTypeId = self.pickers.answerItemTypeIdList.itemTypeIds[index];
                            }
                            self.pickers.answerItemTypeIdList.show = false;
                        }
                    },
                    // 题目的答案类型(可以作为二级题型使用)
                    answerTypeList:{
                        index: 1,
                        value: '普通填空',
                        show: false,
                        items:["未命名", "普通填空", "估测题", "涂色题", "连线题", "画图题"],
                        onConfirm:(value, index) => {
                            if(self.pickers.answerTypeList.value != value){
                                self.pickers.answerTypeList.value = value;
                                //答案类型修改前，可能并没有获取到答案内容
                                self.get_select_answer_area().AnsweType = index+"";
                                self.get_select_answer_area().Answers.forEach(a => {
                                    a.AnsweType = index;
                                });
                            }
                            self.pickers.answerTypeList.show = false;
                        }
                    }
                }
            };
        },
        methods: {
            onLoad(){
                onPageLoad(this)
                Logger.info('home onLoad');
            },
            onRefresh(){
                Logger.info('home onRefresh');
                // 清空列表数据
                this.tasks.finished = false;
                // 重新加载数据
                this.tasks.loading = true;
                this.onLoad();
            },
            onItemClick(ids){
                var self = this;
                set_select_item(self, ids);
            },
            copyAnswerArea(){},
            onPointerMove(e){
                var self = this;
                // console.log('onPointerMove:', e);
                let x = e.offsetX;
                let y = e.offsetY;
                self.mouse_point = { x, y};
    
                //鼠标移动到答案区，自动选中当前答案
                var id_list = [];
                self.items.forEach((level, level_idx) => {
                    if(!level.items) return;
                    level.items.forEach((stem, stem_idx) => {
                        if(!stem.Models) return;
                        stem.Models.forEach((sub_stem, sub_stem_idx) => {
                            if(!sub_stem.Models) return;
                            sub_stem.Models.forEach((answer_area, answer_area_idx) => {
                                //鼠标是否移动到当前答案
                                if(self.mouse_point){
                                    if (is_point_in_polygon(answer_area.Points, self.mouse_point)){
                                        id_list = [
                                            { index: level_idx, id: level.id },
                                            { index: stem_idx, id: stem.MarkId },
                                            { index: sub_stem_idx, id: sub_stem.MarkId},
                                            { index: answer_area_idx, id: answer_area.MarkId}
                                        ];
                                    }
                                }
                            });
                        });
                    });
                });
                if (id_list.length > 0){
                    self.move_selected_item = id_list;
                }else{
                    self.move_selected_item = null;
                }
            },
            onPointerClick(e){
                var self = this;
                if(self.move_selected_item){
                    set_select_item(self, self.move_selected_item);
                }
            },
            onPointerUp(e){
                var self = this;
                save_select_item(self, e);
            },
            onPointerDown(e){
                var self = this;
                let x = e.offsetX;
                let y = e.offsetY;
                // console.log("鼠标按下", x, y);
                self.start_point = {x, y};
                // self.mouse_point = None;
                // self.polygon.push(Point::new(x, y));
                // let me:&MouseEvent = &*e;
                // info!("鼠标事件 {}x{} {:?}", x, y, me.button());
            },
            loadPage(){
                loadPage(this);
            },
            reloadPage(){ location.replace('/'); },
            get_select_question_level(){
                var self = this;
                return self.items[self.selected_item[0].index];
            },
        
            get_select_question_stem(){
                var self = this;
                return self.items[self.selected_item[0].index].items[self.selected_item[1].index];
            },
        
            get_select_question_stem_index(){
                var self = this;
                return self.selected_item[1].index;
            },
        
            get_select_sub_question_stem(){
                var self = this;
                try{
                    return self.items[self.selected_item[0].index].items[self.selected_item[1].index].Models[self.selected_item[2].index];
                }catch(e){
                    console.warn('当前未选中子题干');
                    return null;
                }
            },
        
            get_select_sub_question_stem_index(){
                var self = this;
                return self.selected_item[2].index;
            },
        
            get_select_answer_area(){
                var self = this;
                return self.items[self.selected_item[0].index].items[self.selected_item[1].index].Models[self.selected_item[2].index].Models[self.selected_item[3].index];
            },
        
            get_select_answer_area_index(){
                var self = this;
                return self.selected_item[3].index;
            },
            get_mark_id(){
                var self = this;
                get_mark_id(self);
            },
            delete_item(){
                var self = this;
                delete_item(self);
            },
            start_upload(){
                startUpload(this);
            },
            change_combination_type(val){
                var self = this;
                let sub_stem = self.get_select_sub_question_stem();
                sub_stem.Models.forEach(a => {
                    a.CombinationType = val;
                });
            },
            //判断是否选择了答案
            is_select_answer_area(){
                var self = this;
                // try{
                //     self.get_select_answer_area();
                // }catch(e){
                //     console.warn('当前未选中答案');
                //     return false;
                // }
                return self.selected_item_type==SelectItemType.AnswerArea;
            },
            //判断是否是选中了小题干
            is_sub_question_stem(){
                var self = this;
                var mark = self.get_select_sub_question_stem();
                if(!mark){
                    return false;
                }
                //填充当前选中题目的答案组合模式
                var is = self.selected_item_type==SelectItemType.SubQuestionStem;
                return is;
            },
            //获取当前小题的答案模式
            get_combination_type(){
                var self = this;
                var mark = self.get_select_sub_question_stem();
                var combination_type = '';
                if (mark.Models && mark.Models.length > 0){
                    combination_type = mark.Models[0].CombinationType;
                }
                if(!combination_type){ combination_type=''; }
                self.combination_type = combination_type;
                return combination_type;
            },
            change_item_level(){
                var self = this;
                vant.Dialog.confirm({
                    title: '温馨提示',
                    message:'确定要切换当前大题的A、B级吗？',
                })
                .then(() => {
                    if (SelectItemType.QuestionStem == self.selected_item_type){
                        //移动A、B级别
                        let mark_idx = self.get_select_question_stem_index();
                        let level = self.get_select_question_level().level+'';
                        
                        var mark = self.get_select_question_level().items.splice(mark_idx, 1);
    
                        if(!mark || mark.length == 0){
                            alertMessage('未选中大题');
                        }else{
                            mark = mark[0];
                            if (level == "B"){
                                mark.QuestionCategory = "A";
                                self.items[0].items.push(mark);
                            }else{
                                mark.QuestionCategory = "B";
                                self.items[1].items.push(mark);   
                            }
                            self.selected_item = [];
                            self.selected_item_type = SelectItemType.None;
                        }
                    }else{
                        alertMessage('未选中大题');
                    }
                });
            },
            change_answer_result(){
                var self = this;
                //修改答案结果
                var val = document.getElementById('input_result').value;
                self.get_select_answer_area().Answers[0].Result = val;
            },
            change_answer_unit(){
                var self = this;
                //修改答案单位
                var val = document.getElementById('input_unit').value;
                self.get_select_answer_area().Answers[0].Unit = val;
            },
            change_answer(){
                var self = this;
                var val = document.getElementById('answer_textarea').value;
                if (self.get_select_answer_area().Answers.length == 0){
                    let answer_type = self.get_select_answer_area().AnswerType;
                    var answer = newAnswer();
                    answer.AnswerType = answer_type;
                    self.get_select_answer_area().Answers.push(answer);
                }
                self.get_select_answer_area().Answers[0].Replys = val;
                // console.log("更新了答案: {:?}", self.get_select_answer_area().Answers[0].Replys);
            },
            delete_answer_solution(idx){
                var self = this;
                if (self.get_select_answer_area().Answers.length > 0){
                    let d = self.get_select_answer_area().Answers[0].Solutions.splice(idx, 1);
                    console.log("删除了一类解题步骤: {:?}", d);
                }
            },
            add_answer_solution(){
                var self = this;
                showLoading('获取MarkId');
                GetMarkId({}).then(MarkId => {
                    hideLoading();
                    console.log('获取MarkId:', MarkId);
                    if (self.get_select_answer_area().Answers.length == 0){
                        let answer_type = self.get_select_answer_area().answer_type;
                        var answer = newAnswer();
                        answer.AnswerType = answer_type;
                        self.get_select_answer_area().Answers.push(answer);
                    }
                    self.get_select_answer_area().Answers[0].Solutions.push({
                        StepId: MarkId,
                        StepContent: '',
                    });
                }).catch(e => {
                    hideLoading();
                    alertMessage('获取MarkId:'+e);
                });
            },
            change_answer_solution(idx){
                var self = this;
                var val = document.getElementById('answer_textarea_'+idx).value;
                // console.log('修改答题思路', val);
                if (self.get_select_answer_area().Answers.length == 0){
                    let answer_type = self.get_select_answer_area().AnswerType;
                    var answer = newAnswer();
                    answer.AnswerType = answer_type;
                    self.get_select_answer_area().answers.push(answer);
                }
                self.get_select_answer_area().Answers[0].Solutions[idx].StepContent = val;
                // console.log("更新了解题步骤", idx, self.get_select_answer_area().Answers[0].Solutions[idx]);
            },
        },
        mounted(){
            var page = this;
            Logger.info('首页mounted');
    
            this.onLoad();
        },
        unmounted(){
            Logger.info('首页unmounted');
        },
    };
}

// 页面加载
function onPageLoad(self){
    // console.log('onPageLoad', self);
    //读取本地存储
    var book = localStorage.book;
    if(!book) book = "1";
    var paper_id = localStorage.paper_id;
    if(!paper_id) paper_id = "";
    var grade = localStorage.grade;
    if(!grade) grade = "1";
    var term = localStorage.term;
    if(!term) term = "1";
    var page_num = localStorage.page;
    if(!page_num) page_num = "1";
    // console.log("本地存储:", grade, term, page_num);

    book = parseInt(book);
    grade = parseInt(grade);
    term = parseInt(term);
    page_num = parseInt(page_num);

    let canvas_width = 670;
    let canvas_height = 947;

    self.tip_text = "点击选中“A级题目”或“B级题目”后操作";
    self.canvas = self.$refs.canvas;
    self.key_shift_down = false;
    self.is_loading = false;
    self.canvas_width = canvas_width;
    self.canvas_height = canvas_height;
    self.image_width = 0;
    self.image_height = 0;
    self.image_scale = 1.0;
    self.paper_id = paper_id;
    self.book = book;
    self.grade = grade;
    self.term = term;
    self.page = page_num;
    self.chapter_id = '';
    self.second_chapter_id = null;
    self.items = [
        /*
            id: String,
            selected: bool,
            // A 或 B
            level: String,
            name: String,
            items: Vec<Mark>
        */
        { name:"A级题目", level: "A", id: 'A', selected: false, items: [] },
        { name:"B级题目", level: "B", id: 'B', selected: false, items: [] },
    ];
    self.selected_item = [];
    self.selected_item_type = SelectItemType.None;
    self.move_selected_item = null;
    self.start_point = null;
    self.mouse_point = null;
    self.polygon = [];
    self.chapters = [];
    self.ctx2d = self.canvas.getContext("2d");
    self.work_book_page_info = null;
    self.page_ids = [];
    self.work_book_page_id = "";
    self._render_loop = null;
    self.last_upload_time = 0.;
    self.papers = [
        { paper_id: "1397781937136865280", paper_name: "测试试卷" }
    ];

    // 选中默认年级
    var gradeIndex = parseInt(grade)-1;
    self.pickers.grades.index = gradeIndex;
    self.pickers.grades.value = self.pickers.grades.items[gradeIndex];
    // 选中默认学期
    var termIndex = parseInt(term)-1;
    self.pickers.terms.index = termIndex;
    self.pickers.terms.value = self.pickers.terms.items[termIndex];

    // The callback to request animation frame is passed a time value which can be used for
    // rendering motion independent of the framerate which may vary.
    // let render_frame = self.link.callback(Msg::Render);
    // let handle = RenderService::request_animation_frame(render_frame);

    // A reference to the handle must be stored, otherwise it is dropped and the render won't
    // occur.
    // self._render_loop = Some(handle);

    self.image = new Image();
    self.image.onload = function(){
        // console.log("图片 onLoad 方法调用");
        //获取标记信息
        let image = self.image;
        self.image_width = image.width;
        self.image_height = image.height;
        let image_width = image.width;
        // let image_height = image.height();

        self.image_scale = self.canvas_width/image_width;
        // console.log("缩放比例=", self.image_scale);
        let info1 = self.work_book_page_info;
        let book = self.book;
        let paper_id = self.paper_id;
        if(paper_id == null){
            paper_id = '';
        }

        showLoading('获取Mark列表');
        //获取Mark列表
        GetWorkbookMarkJson({
            PaperType: book,
            Term: info1.Term,
            Grade: info1.Grade,
            Page: info1.Page,
            workbookPageId: info1.Id,
            PaperId: paper_id,
        }).then(res => {
            hideLoading();
            loadMarks(self, res);
        }).catch(e => {
            console.error(e);
            hideLoading();
            alertMessage('GetWorkbookMarkJson'+e);
        });
    };

    // //监听键盘
    // let window = yew::utils::window();

    //加载页面信息
    self.loadPage();

    //循环绘制
    window.draw = function draw(timestamp){
        //闭包访问 self
        drawCanvas(self, timestamp);
        window.requestAnimationFrame(window.draw);
    };
    window.requestAnimationFrame(window.draw);

    window.onkeydown = function(e){
        if (e.key == "Shift"){
            self.key_shift_down = true;
        }
    }
    window.onkeyup = function(e){
        if (e.key == "Escape"){
            self.polygon = [];
        }
        if (e.key == "Shift"){
            self.key_shift_down = false;
        }
    }
}

// 绘制画布
function drawCanvas(self, timestamp){
    if (self.last_upload_time == 0.){
        self.last_upload_time = timestamp;
    }
    if (timestamp-self.last_upload_time>10.*1000.){
        self.last_upload_time = timestamp;
        // info!("自动上传");
        // self.link.send_message(Msg::StartUpload(false));
    }
    let ctx2d = self.ctx2d;
    ctx2d.clearRect(0., 0., self.canvas_width, self.canvas_height);
    // info!("draw..");

    let image = self.image;
    let image_width = image.width;
    // let image_height = image.height();

    // info!("{}x{} {}x{}", width, height, dw, dh);
    ctx2d.save();
    ctx2d.scale(self.image_scale, self.image_scale);
    ctx2d.drawImage(image, 0., 0.);
    ctx2d.restore();

    //绘制鼠标位置
    if (self.mouse_point){
        let mouse_point = self.mouse_point;
        let x = mouse_point.x;
        let y = mouse_point.y;
        let w = 6;
        ctx2d.strokeStyle = "#0000ff";
        ctx2d.lineWidth = 0.5;
        ctx2d.beginPath();
        ctx2d.moveTo(x, y-w);
        ctx2d.lineTo(x, y+w);
        ctx2d.stroke();
        ctx2d.beginPath();
        ctx2d.moveTo(x-w, y);
        ctx2d.lineTo(x+w, y);
        ctx2d.stroke();
    }
    ctx2d.lineWidth = 1;

    //绘制所有题目
    let gray_color = "#aaa";
    let red_color = "#ff0000";
    let blue_color = "#0000ff";
    if(self.items){
        self.items.forEach(level => {
            if(level.items){
                level.items.forEach(stem => {
                    draw_question_stem(ctx2d, stem, gray_color);
                    if(stem.Models){
                        stem.Models.forEach(sub_stem => {
                            darw_sub_question_stem(ctx2d, sub_stem, gray_color);
                            if(sub_stem.Models){
                                sub_stem.Models.forEach(answer_area => {
                                    darw_answer_area(ctx2d, answer_area, gray_color, gray_color);
                                    //鼠标是否移动到当前答案
                                    if(self.mouse_point){
                                        let pt = self.mouse_point;
                                        if (is_point_in_polygon(answer_area.Points, pt)){
                                            darw_answer_area(ctx2d, answer_area, blue_color, red_color);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    switch (self.selected_item_type){
        case SelectItemType.None: break;
        case SelectItemType.QuestionLevel:break;
        case SelectItemType.QuestionStem:
            //选中题干，鼠标按下绘制正方形(蓝色虚线)
            let stem = self.get_select_question_stem();
            ctx2d.strokeStyle = "#0000ff";
            ctx2d.setLineDash([8, 4]);
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    let width = ep.x - x;
                    let height = ep.y - y;
                    ctx2d.strokeRect(x, y, width, height);
                }
            }else{
                draw_question_stem(ctx2d, stem, blue_color);
            }
            break;
        case SelectItemType.SubQuestionStem:
            //选中小题，蓝色
            let sub_stem = self.get_select_sub_question_stem();
            ctx2d.strokeStyle = "#0000ff";
            ctx2d.setLineDash([]);
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    let width = ep.x - x;
                    let height = ep.y - y;
                    ctx2d.strokeRect(x, y, width, height);
                }
            }else{
                darw_sub_question_stem(ctx2d, sub_stem, blue_color);
            }
            break;
        case SelectItemType.AnswerArea:
            darw_answer_area(ctx2d, self.get_select_answer_area(), blue_color, red_color);
            break;
        case SelectItemType.AnswerTemplate:
            //绘制临时模板区域
            var drawing = false;
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    ctx2d.strokeStyle = "#ff0000";
                    ctx2d.setLineDash([8, 4]);
                    let width = ep.x - x;
                    let height = ep.y - y;
                    ctx2d.strokeRect(x, y, width, height);
                    drawing = true;
                }
            }
            if (!drawing){
                darw_answer_area(ctx2d, self.get_select_answer_area(), blue_color, gray_color);
            }
            break;
        case SelectItemType.AnswerMark:

            if (self.key_shift_down){
                //shift按下，绘制长方形答案临时区域
                var drawing = false;
                if (self.start_point){
                    let sp = self.start_point;
                    let x = sp.x;
                    let y = sp.y;
                    if(self.mouse_point){
                        let ep = self.mouse_point;
                        ctx2d.strokeStyle = red_color;
                        ctx2d.setLineDash([8, 4]);
                    
                        let width = ep.x - x;
                        let height = ep.y - y;
                        ctx2d.strokeRect(x, y, width, height);
                        drawing = true;
                    }
                }
                if (!drawing){
                    darw_answer_area(ctx2d, self.get_select_answer_area(), blue_color, gray_color);
                }
            }else{
                //虚线绘制临时答案区域(多边形)
                if (self.polygon.length>0){
                    ctx2d.strokeStyle = red_color;
                    ctx2d.setLineDash([8, 4]);
                    let points = self.polygon;
                    ctx2d.beginPath();
                    ctx2d.moveTo(points[0].X, points[0].Y);
                    for (var i=1; i<points.length; i++){
                        ctx2d.lineTo(points[i].X, points[i].Y);
                    }
                    //绘制鼠标当前点
                    if(self.mouse_point){
                        ctx2d.lineTo(self.mouse_point.x, self.mouse_point.y);
                    }
                    ctx2d.stroke();
                }else{
                    darw_answer_area(ctx2d, self.get_select_answer_area(), gray_color, red_color);
                }
            }
            break;
    }
}

function loadMarks(self, info){
    // console.log("loadMarks:", info);
    /*
    1年级2学期 736x1047
    2年级2学期 736x1047
    3年级2学期 724x1023
    4年级2学期 724x1023
    5年级2学期 724x1023
        */

    // let image = self.image.as_ref().unwrap();
    // let image_width = image.width();
    // let image_height = image.height();
    // info!(">> image_width={} image_height={}", image_width, image_height);
    
    // if self.grade < 3{
    //     self.image_scale = self.canvas_width / 736.;
    // }else{
    //     self.image_scale = self.canvas_width / 724.;
    // }
    //获取Mark列表之前，图片已经加载完成，image_scale已经计算好
    if(info.Models){
        marks_scale_mul(info.Models, self.image_scale);
    }
    info.Models.forEach(mark => {
        //每个mark要缩小
        if(mark.QuestionCategory == "B"){
            self.items[1].items.push(mark);
        }else{
            self.items[0].items.push(mark);
        }
    });
    //倒推章节
    let chapter_id = info.ChapterId;
    self.chapters.forEach(c1 => {
        if(c1.Second){
            c1.Second.forEach(c2 => {
                if (c2.ChapterId == chapter_id){
                    self.second_chapter_id = c2.ChapterId+'';
                    self.chapter_id = c1.ChapterId+'';
                    //设置章节选中项目
                    self.pickers.chapters.currentValue = self.second_chapter_id;
                    self.pickers.chapters.value = c1.ChapterName +' > '+ c2.ChapterName;
                }
            });
        }
    });
}

function loadPage(self){
    //打开图片
    let book = self.book;
    let grade = self.grade;
    let term = self.term;
    let page = self.page;
    // console.log('loadPage book='+book+", grade="+grade+", term="+term+", page="+self.page);

    // console.log('设置localStorage.book=', book);
    // localStorage.setItem("book", book+"");
    
    // 
    // localStorage.setItem("term", term+"");
    // localStorage.setItem("page", page+"");

    //----- 设置下拉框 book类型 --------
    var bookTypesIndex = 0;
    if(parseInt(book) == 2){
        bookTypesIndex = 1;
    }
    self.pickers.bookTypes.index = bookTypesIndex;
    self.pickers.bookTypes.value = self.pickers.bookTypes.items[bookTypesIndex];

    //删除当前信息
    self.last_upload_time = 0.;
    self.selected_item_type = SelectItemType.None;
    self.selected_item = [];
    self.items[0].items = [];
    self.items[1].items = [];
    self.chapter_id = null;
    self.second_chapter_id = null;
    self.tip_text = "点击选中“A级题目”或“B级题目”后操作";

    //获取章节
    showLoading('加载中');
    load_chapters(self);

    //获取试卷列表
    getPaperList("").then(res => {
        self.papers = res;
        //试卷列表展示到picker中
        self.pickers.bookPapers.items = ["选择关联试卷"];
        var bookPapersIndex = 0;
        self.papers.forEach((p, index) => {
            self.pickers.bookPapers.items.push(p.Title);
            if(p.Id == self.paper_id){
                bookPapersIndex = index+1;
            }
        });
        self.pickers.bookPapers.index = bookPapersIndex;
        self.pickers.bookPapers.value = self.pickers.bookPapers.items[bookPapersIndex];
    }).catch(e => {
        console.error(e);
        alertMessage("试卷列表获取失败 "+e);
    });
}

function load_chapters(self){
    let grade = self.grade;
    let term = self.term;
    getChapters(grade, term).then(chapters => {
        self.chapters = chapters;


        //渲染章节
        // console.log('章节加载完成:', chapters);
        self.pickers.chapters.options = [];
        var options = self.pickers.chapters.options;
        chapters.forEach(c => {
            var children = [];
            if(c.Second && c.Second.forEach){
                c.Second.forEach(c2 => {
                    children.push({
                        text: c2.ChapterName,
                        value: c2.ChapterId,
                        parentId: c2.ParentId
                    });
                });
            }
            options.push({
                text: c.ChapterName,
                value: c.ChapterId,
                parentId: c.ParentId,
                children,
            });
        });

        // 获取页码图片信息

        //先获取所有页码列表，然后再选取一个页
        getPageIdsByPaperType({
            PaperType: self.book,
            PaperId: self.paper_id==null?'':self.paper_id,
            Grade: self.grade,
            Term: self.term,
        }).then(res => {
            set_page_ids(self, res);
            hideLoading();
        }).catch(e => {
            hideLoading();
            alertMessage('页码列表获取失败:'+ e);
        });
    }).catch(e => {
        console.error(e);
        hideLoading();
        alertMessage('章节获取失败:'+ e);
    });
}

function set_page_ids(self, ids){

    self.page_ids = ids;
    // 获取页码信息
    let book = self.book;
    let grade = self.grade;
    var page = self.page;

    //如果当前页码列表不包含缓存的页，重新选择第一页
    var page_valid = false;
    for(var i=0; i<self.page_ids.length; i++){
        if(self.page_ids[i] == page){
            page_valid = true;
        }
    }
    if(!page_valid){
        page = self.page_ids[0];
    }
    if(!page){
        page = "1";
    }
    self.page = page;

    // 设置select
    var bookPageIdsIndex = 0;
    self.pickers.pageIds.items = [];
    self.page_ids.forEach((p, index) => {
        self.pickers.pageIds.items.push('第'+p+'页');
        if(self.page == p){
            bookPageIdsIndex = index;
        }
    });
    self.pickers.pageIds.index = bookPageIdsIndex;
    self.pickers.pageIds.value = self.pickers.pageIds.items[bookPageIdsIndex];

    let term = self.term;
    let paper_id = self.paper_id;
    if(paper_id == null) paper_id = '';

    //paperType={}&term={}&grade={}&page={}&PaperId={}", BASE_URL, book, term,grade, page, paper_id
    GetWorkbookPageByGtp({
        paperType: book,
        term,
        grade,
        page,
        PaperId: paper_id
    }).then(res => {
        hideLoading();
        load_workbook_page_info(self, res);
    }).catch(e => {
        console.error(e);
        hideLoading();
        alertMessage('页面标记获取失败:'+ e);
    });
}

function load_workbook_page_info(self, info){
    self.work_book_page_id = info.Id;
    self.paper_id = info.PaperId;
    console.log("打开图片:", info.ImgUrl);
    self.image.src = info.ImgUrl;
    //图片加载完成再获取标记信息
    self.work_book_page_info = info;
}

/// 设置选中项 
// id_list [{ index, id }]
function set_select_item(self, id_list){
    // info!("设置当前选中项.. {:?}", id_list);
    self.selected_item = id_list;
    self.selected_item_id = '';
    if(id_list.length > 0){
        self.selected_item_id = id_list[id_list.length-1].id;
    }
    let max = self.selected_item.length;
    if (max == 1){
        self.selected_item_type = SelectItemType.QuestionLevel;
        self.tip_text = "点击“添加子项”，添加一个大题";
    }else if (max == 2){
        self.selected_item_type = SelectItemType.QuestionStem;
        self.tip_text = "点击“添加子项”，添加一个小题";
    }else if (max == 3){
        self.selected_item_type = SelectItemType.SubQuestionStem;
        self.tip_text = "点击“添加子项”，添加一个答题区域（标记区自动复制上一答案）";
    }else if (max == 4){
        self.selected_item_type = SelectItemType.AnswerArea;
        self.tip_text = "在右侧编辑区，修改题目类型、录入题目答案";

        //设置当前选中答案(用于渲染)
        self.selected_mark = self.get_select_answer_area();

        //拼装答案
        console.log("选中答案:", self.selected_mark);

        //设置AnswerType
        if(self.selected_mark.Answers && self.selected_mark.Answers.length > 0){
            self.pickers.answerTypeList.index = parseInt(self.selected_mark.Answers[0].AnswerType);
        }else{
            self.pickers.answerTypeList.index = 1;
        }
        self.pickers.answerTypeList.value = self.pickers.answerTypeList.items[self.pickers.answerTypeList.index];

        //设置智能识别、非智能识别
        if(typeof(self.selected_mark.Type) == "number"){
            self.pickers.answerTypeIdList.index = self.selected_mark.Type - 1;
        }else{
            self.pickers.answerTypeIdList.index = 1;
        }
        self.pickers.answerTypeIdList.value = self.pickers.answerTypeIdList.items[self.pickers.answerTypeIdList.index];

        //题型
        if(typeof(self.selected_mark.ItemTypeId) == "number"){
            var index = 1;
            for(var j=0; j<self.pickers.answerItemTypeIdList.itemTypeIds.length; j++){
                if(self.selected_mark.ItemTypeId == self.pickers.answerItemTypeIdList.itemTypeIds[j]){
                    index = j;
                }
            }
            self.pickers.answerItemTypeIdList.index = index;
        }else{
            self.pickers.answerItemTypeIdList.index = 1;
        }
        console.log('self.pickers.answerItemTypeIdList.index=', self.pickers.answerItemTypeIdList.index);
        self.pickers.answerItemTypeIdList.value = self.pickers.answerItemTypeIdList.items[self.pickers.answerItemTypeIdList.index];

    }else if (max == 5){
        //检查是选中了标记区还是答案区
        let answer_item_index = self.selected_item[4].index;
        if (answer_item_index == 0){
            self.selected_item_type = SelectItemType.AnswerTemplate;
            self.tip_text = "框选一个答题框附近的图片，用于定位（没有图片选择文字块）";
        }else{
            self.selected_item_type = SelectItemType.AnswerMark;
            self.tip_text = "单击标记多边形区域顶点，或按住Shift键框选长方形答案区";
        }
    }
    //清空polygon
    self.polygon = [];
}


//鼠标弹起，检查是否要保存当前新项目
function save_select_item(self, e){
    let x = e.offsetX;
    let y = e.offsetY;
    var need_save = false;

    switch (self.selected_item_type){
        case SelectItemType.QuestionStem:
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    let width = ep.x - x;
                    let height = ep.y - y;
                    //面积太少不处理
                    if (width * height > 100.){
                        //保存题干框
                        let points = rect_to_points({x, y, width, height});
                        console.log("保存题干", points);
                        self.get_select_question_stem().Points = points;
                        need_save = true;
                    }
                }
            }
        break;
        case SelectItemType.SubQuestionStem:
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    let width = ep.x - x;
                    let height = ep.y - y;
                    if (width * height > 100.){
                        let points = rect_to_points({x, y, width, height});
                        console.log("保存子题干 {:?}", points);
                        self.get_select_sub_question_stem().Points = points;
                        need_save = true;
                    }
                }
            }
        break;
        case SelectItemType.AnswerMark:
            // shift按下 保存正方形
            if (self.key_shift_down){
                if (self.start_point){
                    let sp = self.start_point;
                    let x = sp.x;
                    let y = sp.y;
                    if(self.mouse_point){
                        let ep = self.mouse_point;
                        let width = ep.x - x;
                        let height = ep.y - y;
                        if (width * height > 100.){
                            //保存答案区
                            self.get_select_answer_area().Points = rect_to_points({x, y, width, height});
                            console.log("保存答案区", self.get_select_answer_area().Points);
                            need_save = true;
                        }
                    }
                }
            }else{
                //每次鼠标弹起记录一个点
                if (self.polygon.length > 0){
                    var last = self.polygon[self.polygon.length-1];
                    if (last.X == x && last.Y == y){
                        console.log("重复点击");
                    }else{
                        self.polygon.push({X:x, Y:y});
                    }
                }else{
                    self.polygon.push({X:x, Y:y});
                }
                //检测polygon是否闭合，闭合后存储答案区域中
                if (self.polygon.length>3){
                    //至少4个点
                    //如果最后一个点和第一个点距离小于10，说明重合，结束框选，并删除最后一个点
                    if (calc_distance(self.polygon[0], self.polygon[self.polygon.length-1]) < 10.){
                        let _ = self.polygon.pop();
                        let points = cloneObject(self.polygon);
                        self.polygon = [];
                        //保存区域
                        if(self.selected_item_type == SelectItemType.AnswerMark){
                            console.log("保存答案区", points);
                            self.get_select_answer_area().Points = points;
                            need_save = true;
                        }
                    }
                }
            }
        
        break;
        case SelectItemType.AnswerTemplate:
            if (self.start_point){
                let sp = self.start_point;
                let x = sp.x;
                let y = sp.y;
                if(self.mouse_point){
                    let ep = self.mouse_point;
                    let width = ep.x - x;
                    let height = ep.y - y;
                    if (width * height > 100.){
                        //保存标记区
                        console.log('self.get_select_answer_area()=', self.get_select_answer_area());
                        self.get_select_answer_area().Template = {X:x, Y:y, Width:width, Height:height};
                        console.log("保存标记区", self.get_select_answer_area().Template);
                        need_save = true;
                    }
                }
            }
        break;
    }

    if (need_save){
        // self.save_local();
    }
    
    self.start_point = null;
    self.mouse_point = null;
}

/// 上传mark
function startUpload(self){
    if (!self.second_chapter_id){
        alertMessage('没有设置章节!');
    }else{
        vant.Dialog.confirm({
            title: '温馨提示',
            message:'确定要保存并覆盖标记数据吗？',
        })
        .then(() => {
            showLoading('正在保存');
            let chapter_id = self.second_chapter_id;
            //拷贝一份items做放大图处理后上传
            var items = JSON.parse(JSON.stringify(self.items));
            items.forEach(level => {
                //上传时全部放大
                marks_scale_div(level.items, self.image_scale);
            });
            let book = self.book;
            let grade = self.grade;
            let page = self.page;
            let term = self.term;
            let image_width = self.image_width;
            let image_height = self.image_height;
            let paper_id = self.paper_id;
            uploadMarks(image_width, image_height, paper_id, chapter_id, items, book, grade, page, term);
        }).catch(e => {
            vant.Toast('已取消保存');
        });
    }
}


//上传标签
function uploadMarks(image_width, image_height, PaperId, ChapterId, items, PaperType, Grade, Page, Term){
    var submit_data = {
        PaperId,
        PaperType,
        Grade,
        Page,
        Term,
        Models: [],
        ChapterId,
    };

    items.forEach(level => {
        //每个级别的所有大题
        level.items.forEach((stem, _idx) => {
            stem.ImgHeigh = parseInt(image_height);
            stem.ImgWidth = parseInt(image_width);
            //每个大题的所有小题
            if(stem.Models)
            stem.Models.forEach(sub_stem => {
                sub_stem.ImgHeigh = parseInt(image_height);
                sub_stem.ImgWidth = parseInt(image_width);
                //每个小题的所有答案
                if(sub_stem.Models)
                sub_stem.Models.forEach(answer => {
                    answer.ImgHeigh = parseInt(image_height);
                    answer.ImgWidth = parseInt(image_width);
                });
            });
            add_mark(submit_data, stem);
        });
    });
    let url = "admin/AdminWorkbook/Mark";

    let body = JSON.stringify(submit_data);
    console.log("提交信息: ", body);
    showLoading('正在上传');
    post_data(url, body).then(res => {
        console.log('保存成功:', res);
        hideLoading();
        vant.Toast('保存成功');
    }).catch(e => {
        console.error('保存失败:', e);
        hideLoading();
        vant.Toast('保存失败');
    });
}

function add_mark(self, mark){
    if (!self.Models){
        self.Models = [];
    }
    self.Models.push(mark);
}

function remove_mark(self, idx){
    if(self.Models){
        var del = self.Models.splice(idx, 1);
        return del[0];
    }
}

/// 每次添加项目的时候，都要获取一个新的MarkId
function get_mark_id(self){
    showLoading('获取MarkId');
    GetMarkId({}).then(res => {
        hideLoading();
        console.log('获取MarkId:', res);
        add_item(self, res);
    }).catch(e => {
        console.error(e);
        hideLoading();
        alertMessage('获取MarkId:'+e);
    });
}

/// 添加一项
function add_item(self, mark_id){
    let work_book_page_id = self.work_book_page_id;
    let book_id = self.book;
    let paper_id = self.paper_id;
    let image_width = self.image_width;
    let image_height = self.image_height;

    var level;
    switch (self.selected_item_type){
        case SelectItemType.QuestionLevel:
            //添加题干
            level = self.get_select_question_level().level;
            self.get_select_question_level().items.push(newMark(book_id, paper_id, work_book_page_id, mark_id, level, 1));
        break;
        case SelectItemType.QuestionStem:
            //添加小题
            level = self.get_select_question_level().level+'';
            add_mark(self.get_select_question_stem(), newMark(book_id, paper_id, work_book_page_id, mark_id, level, 2));
            break;
        case SelectItemType.SubQuestionStem:
            level = self.get_select_question_level().level+'';
            
            var mark = newMark(book_id, paper_id, work_book_page_id, mark_id, level, 3);
            //复制上一个框的模板区域
            if (self.get_select_sub_question_stem().Models.length > 0){
                mark.Template = cloneObject(self.get_select_sub_question_stem().Models[0].Template);
            }
            //如果上一个模板区域没有，那么复制上一个小题的第一个模板标记区
            else if (self.get_select_question_stem().Models.length>0){
                if (self.get_select_question_stem().Models[0].Models.length > 0){
                    mark.Template = cloneObject(self.get_select_question_stem().models()[0].models()[0].Template);
                }
            }

            //添加答案区域
            add_mark(self.get_select_sub_question_stem(), mark);
            break;
        default:
            alertMessage('请先选中父元素!');
            break;
    }

    // self.save_local();
}

function delete_item(self){
    //确认对话框
    vant.Dialog.confirm({
        title: '温馨提示',
        message:'确定要删除当前选中的项吗？',
    })
    .then(() => {
        //检查当前项是否有子项
        switch (self.selected_item_type){
            case SelectItemType.QuestionStem:
                //删除题干
                //查查题干子项是否为空
                if (self.get_select_question_stem().Models.length > 0){
                    vant.Dialog({ message: "子元素不为空" });
                }else{
                    //level删除
                    let idx = self.get_select_question_stem_index();
                    let o = self.get_select_question_level().items.splice(idx, 1)[0];
                    self.selected_item = [];
                    self.selected_item_type = SelectItemType.None;
                    delete_mark(self, o.MarkId);
                }
            break;
            case SelectItemType.SubQuestionStem:
                //删除小题
                if (self.get_select_sub_question_stem().Models.length > 0){
                    vant.Dialog({ message: "子元素不为空" });
                }else{
                    let idx = self.get_select_sub_question_stem_index();
                    let o = remove_mark(self.get_select_question_stem(), idx);
                    self.selected_item = [];
                    self.selected_item_type = SelectItemType.None;
                    delete_mark(self, o.MarkId);
                }
            break;
            case SelectItemType.AnswerArea:
                //删除答案区域
                let idx = self.get_select_answer_area_index();
                let o = remove_mark(self.get_select_sub_question_stem(), idx);
                //删除选中项
                self.selected_item = [];
                self.selected_item_type = SelectItemType.None;
                delete_mark(self, o.MarkId);
            break;
            default:
                alertMessage('未选中项目！');
            break;
        }
        // self.save_local();
    });
}

function delete_mark(self, mark_id){
    DeleteWorkbookMark({
        PaperType: self.book,
        MarkId: mark_id,
        Grade: self.grade,
        Term: self.term,
        Page: self.page,
    }).then(res => {
        vant.Toast('Mark删除成功!');
    }).catch(e =>{
        alertMessage("Mark删除失败"+ err);
    });
}

function newMark(PaperType, PaperId, WorkbookPageId, MarkId, QuestionCategory, QuestionLevel){
    var mark = defaultMark();
    mark.PaperId = PaperId;
    mark.WorkbookPageId = WorkbookPageId;
    mark.MarkId = MarkId;
    mark.QuestionCategory = QuestionCategory;
    mark.QuestionLevel = QuestionLevel;
    mark.PaperType = PaperType;
    return mark;
}

function defaultMark(){
    return{
        PaperId: '',
        PaperType: 0,
        Answers: [],
        ImgHeigh: 0,
        ImgWidth: 0,
        MarkId: '', 
        // 题目类型 2: 单项选择题 5 填空题 10 多项选择题 11 判断题 23 应用题 36 主观题 39 题型
        ItemTypeId: 5,
        // 题目分类 A, B
        QuestionCategory: '',
        // 题干层级 1,2,3
        QuestionLevel: 0,
        // 对于题干，用来存储题干所属的4个点
        // 对于小题，不存储
        // 对于答案，存储答案的多边形框
        Points: [],
        // Rect
        Template: null,
        /// 标记类型 0: 题干 1:可智能识别题目区域  2:非智能识别题目区域
        /// 题干：框选非智能识别区域的题干
        /// 可智能识别题目区域：框选可以智能识别区域包括题干，之后使用优图api识别后做题目处理
        /// 非智能识别题目区域：框选答题的空白区域
        Type: 2,
        WorkbookPageId: '',
        ///子项
        Models: [],
        /// 答案组合类型：  位置是否可交换
        CombinationType: '',
        /// 这个answer_type用来缓存和展示用户所选答案类型，不序列化到json
        /// 参考 https://serde.rs/field-attrs.html
        answer_type: '1',
        /// 本地标记是否选中
        selected: false,
    };
}

function alertMessage(message){
    vant.Dialog({ message});
}

function newAnswer(){
    return {
        Solutions: [],
        Replys: '',
        AnswerType: '',
        Result: '',
        Unit: '',
    };
}

//-------------- 绘制函数 --------------

function draw_question_stem(ctx2d, stem, color){
    //绘制题干框
    if(!stem.Points || stem.Points.length < 3){
        return;
    }
    let rect = points_to_rect(stem.Points);
    if(rect){
        ctx2d.strokeStyle = color;
        ctx2d.setLineDash([8, 4]);
        ctx2d.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}

function darw_sub_question_stem(ctx2d, sub_stem, color){
    let points = sub_stem.Points;
    if (points.length>0){
        ctx2d.strokeStyle = color;
        ctx2d.setLineDash([8, 4]);

        ctx2d.beginPath();
        ctx2d.moveTo(points[0].X, points[0].Y);
        points.forEach((p, idx) => {
            if(idx == 0) return;
            ctx2d.lineTo(p.X, p.Y); 
        });
        ctx2d.closePath();
        ctx2d.stroke();
    }
}

function darw_answer_area(ctx2d, answer_area, template_color, answer_color){
    //绘制模板区域
    if(answer_area.Template){
        let rect = answer_area.Template;
        ctx2d.strokeStyle = template_color;
        ctx2d.setLineDash([8, 4]);
        ctx2d.strokeRect(rect.X, rect.Y, rect.Width, rect.Height);
    }
    //答案区是多边形
    let points = answer_area.Points;
    if (points.length>0){
        ctx2d.setLineDash([]);
        ctx2d.strokeStyle = answer_color;
        ctx2d.beginPath();
        ctx2d.moveTo(points[0].X, points[0].Y);
        points.forEach((p, idx) => {
            if(idx == 0) return;
            ctx2d.lineTo(p.X, p.Y); 
        });
        ctx2d.closePath();
        ctx2d.stroke();
    }
}