$(function () {

    let $navBoxList = $(".navBox>a");//子代选择器
    let $itemBoxList = null;
    init();

    let $plan = $.Callbacks();

    $plan.add((_, baseInfo) => {
        // console.log(baseInfo)
        //渲染用户信息和实现退出登录
        // console.log("渲染用户信息和实现登录：", baseInfo)
        $(".baseBox>span").html(`你好，${baseInfo.name || ''}`)

        //实现退出登录
        $(".baseBox > a").click(async function () {
            let result = await axios.get("/user/signout")
            if (result.code == 0) {
                //退出登录成功
                window.location.href = "login.html"
                return;
            }
            //退出登录失败
            alert("退出不成功，请稍后再试")
        });
    })



    //拼接菜单的字符串
    $plan.add((power) => {
        // 渲染菜单  userhandle|departhandle|jobhandle|customerall
        console.log("渲染菜单:", power);
        let str = ``;
        if (power.includes("userhandle")) {
            str += `
            <div class="itemBox" text="员工管理">
                <h3>
                    <i class="iconfont icon-yuangong"></i>
                    员工管理
                </h3>
                <nav class="item">
                    <a href="page/userlist.html" target="iframeBox">员工列表</a>
                    <a href="page/useradd.html" target="iframeBox">新增员工</a>
                </nav>
            </div>
            `
        }
        if (power.includes("departhandle")) {
            str += `     
            <div class="itemBox" text="部门管理">
                    <h3>
                        <i class="iconfont icon-guanliyuan"></i>
                       部门管理
                    </h3>
                 <nav class = "item">
                  <a class = "page/departmentlist.html" target = "iframeBox">员工列表</a>
                  <a class = "page/departmentadd.html" target = "iframeBox">新增员工</a>
                 </nav>
            </div>`
        }
        if (power.includes("jobhandle")) {
            str += `     
            <div class="itemBox" text="职位管理">
                    <h3>
                        <i class="iconfont icon-zhiweiguanli"></i>
                       职位管理
                    </h3>
                 <nav class = "item">
                  <a class = "page/joblist.html" target = "iframeBox">员工列表</a>
                  <a class = "page/jobadd.html" target = "iframeBox">新增员工</a>
                 </nav>
            </div>`
        }
        if (power.includes("customerall")) {
            str += `     
            <div class="itemBox" text="客户管理">
                    <h3>
                        <i class="iconfont icon-kehuguanli"></i>
                       客户管理
                    </h3>
                 <nav class = "item">
                  <a class = "page/customerlist.html" target = "iframeBox">我的客户</a>
                  <a class = "page/customerlist.html" target = "iframeBox">我的客户</a>
                  <a class = "page/customeradd.html" target = "iframeBox">新增客户</a>
                 </nav>
            </div>
            `
        }
        $(".menuBox").html(str);

        $itemBoxList = $(".menuBox").find(".itemBox");
    });

    // 控制组织结构和客户管理点击切换
    function handGroup(index) {

        //分为两组 $group1 $group2
        // console.log($itemBoxLIst)
        let $group1 = $itemBoxList.filter((_, item) => {
            //$(item) item是DOM对象 $(item)转为JQ对象
            let text = $(item).attr("text");
            return text === "客户管理"
        });
        let $group2 = $itemBoxList.filter((_, item) => {
            //$(item) item是DOM对象 $(item)转为JQ对象
            let text = $(item).attr("text");
            return /^(员工管理|部门管理|职位管理)/.test(text)
        })
        //控制哪一组显示
        if (index === 0) {
            $group1.css("display", "block");
            $group2.css("display", "none");
        } else if (index === 1) {
            $group1.css("display", "none");
            $group2.css("display", "block");
        }
    }
    //实现tab选项卡功能
    $plan.add(power => {
        //控制默认显示哪一个
        // userhandle|departhandle|jobhandle|customerall
        let initIndex = power.includes("customerall") ? 0 : 1;
        $(this).addClass("active").siblings().removeClass("active");
        handGroup(initIndex);
        // power.includes("customerall") ? 0 : 1
        //$(".navBox")

        //点击切换
        $navBoxList.click(function () {
            let index = $(this).index();
            let text = $(this).html().trim()
            
            if((text === "客户管理") && !/customerall/.test(power) || (text === "组织结构") && !/(userhandle|departhandle|jobhandle)/.test(power)){
                alert("没有权限访问！！！")
                console.log("111111111");
                return
            }
            if (index === initIndex) return;
            $(this).addClass("active").siblings().removeClass("active");
            handGroup(index);
            initIndex = index;
        });
    })
    //控制默认的iframe的src
    $plan.add(power=>{
        let url = "page/customerList.html"
        if(power.includes("customerall")){
            $(".iframeBox").attr("src",url)
        }
    })

    async function init() {
        //判断当前用户有没有登录
        let result = await axios.get("/user/login");
        // console.log(result)
        if (result.code != 0) {
            alert("你还没有登录，请先登录")
            window.location.href = "login.html"
            return;
        }
        //代表你登录成功了
        let [power, baseInfo] = await axios.all([
            axios.get("/user/power"),
            axios.get("/user/info")
        ])
        console.log(power) //获取此用户的权限
        // console.log(baseInfo)  //get user's base information
        power.code === 0 ? power = power.power : null;

        baseInfo.code === 0 ? baseInfo = baseInfo.data : null;


        $plan.fire(power, baseInfo)  //publish
    }
})