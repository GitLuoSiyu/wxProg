// miniprogram/pages/game/game.js
var direction;
var timer;
var db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpen:true,
    startStop:'开始',
    btnBelow:'',
    btnV:'',
    mapHeight:'',
    // 地图中一格的大小
    slength:'',
    allSnake:[],
    food:[],
    score:0,
    auth:0,
    before:1,
    oldOne:'',
    openid:'',
    oldOne:''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        avatar:options.userAvatar,
        auth:options.auth,
      });
    //显示最高分
    this.getOpenid()
    // canvas大小自适应
    var tBarH;
    var winH;
    var mapW;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        //当前屏幕topbar高和方向控制高占的px的和
        // 100rpx换成px,拿到map的px高
        tBarH = 90 * (res.windowWidth / 750);
        winH = res.windowHeight;
        mapW = res.windowWidth;
      },
    }),
    this.setData({
      mapHeight: mapW / 21*22,
      //sLength取两位小数，不然后面会有偏差
      sLength: parseFloat((mapW / 21).toFixed(2)),
      btnBelow: winH - (mapW / 21 * 22) - tBarH,
      btnV: (winH - (mapW / 21 * 22) - tBarH)/2,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


  //单位时间内移动的距离
  var v = this.data.sLength;
  var allSnake = this.data.allSnake;
  var food=this.data.food
  // var pages = getCurrentPages();
  // var perpage = pages[pages.length - 1]

  initGame(allSnake,food,v);

  var that=this;
  timer = setInterval(function () {
  //注意这个顺序！
    moveSnake(allSnake, food, ct, v);
    console.log(that.data.score)
    draw(allSnake, food[0], ct);
    count(that,allSnake,timer);
    testHit(allSnake, v, timer,db, that);
  }
  , 500)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //暂停开始控制
  handleStart(){
    if(this.data.isOpen){
        this.setData({
          startStop : '暂停'
        })
    }else{
      this.setData({
        startStop: '开始'
      })
      var v = this.data.sLength;
      var allSnake = this.data.allSnake;
      var food = this.data.food;
      var that = this;
      // var pages = getCurrentPages();
      // var perpage = pages[pages.length - 1]

      timer = setInterval(function () {
        //注意这个顺序！
        moveSnake(allSnake, food, ct, v);
        draw(allSnake, food[0], ct);
        count(that, allSnake, timer);
        testHit(allSnake, v, timer, db, that);
      }
        , 500)
    }
    this.data.isOpen = !this.data.isOpen
  },
  //方向控制
  handleLeft() {
    direction = 'left';
  },

  handleRight() {
    direction = 'right';
  },

  handleUp() {
    direction = 'up';
  },

  handleDown() {
    direction = 'down';
  },

  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openid)
        that.setData({
          openid: res.result.openid
        })
        // console.log(that.data.openid);
        db.collection('users').where({
          _openid: that.data.openid
        }).get({
          success: res => {
            //成功拿到_openid为用户openid的一条数据时，拿到数据的_id，后面对比分数时有用
            console.log(res.data)
            // var id = res.data[0]._id
            //id不能再这里就获取，因为第一次玩的用户res.data根本就没有
            console.log(res.data.length)
            if (res.data.length==0){
              //该用户第一次玩，必须记录分数
              console.log('第一次已记录')
              db.collection('users').add({
                data: {
                  score: that.data.score
                },
                success: res => {
                  console.log('成功记录')
                },
                fail: res => {
                  console.log('记录不成功')
                },
              });
              // that.setData({
              //   oldOne: res.data[0].score
              // }) 
            }else{
              //拿到上一次的分数,如果这次更高分才记录
              that.setData({
                oldOne: res.data[0].score
              })
              // console.log(that.data.oldOne)
              // console.log(that.data.score)
                
              if (that.data.oldOne < that.data.score) {
                console.log("已经更新分数")
                db.collection('users').doc(id).update({
                  data: {
                    score: that.data.score
                  }
                })
                console.log("已经更新分数")
              }else{
                console.log('这次的分数比上一次一样或者更小不记录')
              }
            }
          },
          fail:err=>{
            console.log(err)
          }

          })
          
                 
        


      }
    })
  },

})
//用来随机一个蛇头坐标（不要有0的情况，不然一开局就容易撞墙）
function randomP(max, min) {
  return Math.floor(Math.random() * (max - min)) + min
};


//创建画布准备画
const ct = wx.createCanvasContext("mapCanvas", this);
//画蛇画食物
function draw (array,food,ctx) {
  for (let i = 0; i < array.length; i++) {
    console.log("已经调用draw");
    ctx.setFillStyle(array[i].color);
    ctx.fillRect(array[i].x, array[i].y, array[i].w, array[i].h);
    };
    ctx.draw();
    console.log(food)
    ctx.setFillStyle(food.color);
    ctx.fillRect(food.x, food.y, food.w, food.h);
    ctx.draw(true)
};


function moveSnake(array,b,ctx,v){
  //小蛇的坐标移动，蛇头根据按键改变方向，其余蛇的身体坐标往前推一格
  //先拿到蛇的尾部，注意是克隆一个，不然后面的一变就变了
  var temp=JSON.stringify(array[array.length-1]);
  var body=JSON.parse(temp);

  // for (var i = 0; i < array.length; i++) {
  //   array[i].x = array[i - 1].x;
  //   array[i].y = array[i - 1].y;
  //   console.log('已经调用身体移动')
  // }
  var i=array.length-1;
  for (; i > 0; i--) {
    array[i].x = array[i - 1].x;
    array[i].y = array[i - 1].y;
    console.log('已经调用身体移动')
  }

  switch (direction) {
    case ('right'):
      array[0].x += v;
      break;
    case ('left'):
      array[0].x -= v;
      break;
    case ('up'):
      array[0].y -= v;
      break;
    case ('down'):
      array[0].y += v;
      break;
  }  
  //下面这些不能删，删了会吃了好几个以后吃不到（不知为啥
  console.log(array[0].x)
  console.log(b[0].x)
  console.log(array[0].y)
  console.log(b[0].y)
  //比较的时候取整避免有轻微误差
  if (parseInt(array[0].x) == parseInt(b[0].x) && parseInt(array[0].y) == parseInt(b[0].y)) {
    console.log("已经撞上了食物");
    console.log(array)
    //随机一个新的食物
    //直接修改food的x/y属性
    var newFood = {
      color: "green",
      x: Math.floor(Math.random() * 21) * v,
      y: Math.floor(Math.random() * 22) * v,
      h: v,
      w: v,
    }
    console.log(b);
    b[0] = newFood;
    console.log(array);
    array.push(body);
  
  };

};

  function initGame(allSnake,food,v){
      //初始化小蛇
      //先随机一个初始方向
    var dirc = ['', 'right', 'left', 'up', 'down'];
    var dircInit = dirc[randomP(4, 1)];
    var snake0 = {
        color: "#FFC0CB",
        h: v,
        w: v,
      };
    snake0.x = randomP(20, 1) * v;
    snake0.y = randomP(21, 1) * v;

    var snake1 = {
        color: "#FFC0CB",
        h: v,
        w: v,
      };

    switch (dircInit) {
      case ('right'):
          snake1.x = snake0.x - v;
          snake1.y = snake0.y;
          direction = 'right';
          break;
      case ('left'):
          snake1.x = snake0.x + v;
          snake1.y = snake0.y;
          direction = 'left';
          break;
      case ('up'):
          snake1.x = snake0.x;
          snake1.y = snake0.y + v;
          direction = 'up';
          break;
      case ('down'):
          snake1.x = snake0.x;
          snake1.y = snake0.y - v;
          direction = 'down';
          break;
      }
    allSnake.push(snake0);
    allSnake.push(snake1);

    var aFood = {
        color: "green",
        x: Math.floor(Math.random() * 21) * v,
        y: Math.floor(Math.random() * 22) * v,
        h: v,
        w: v,
      };
      food.push(aFood);
    }

function count(that, allSnake,timer){
  that.setData({
    score:allSnake.length-2
  });
  //暂停检测
  if (!that.data.isOpen) {
    clearInterval(timer)
  }
}

function testHit(allSnake, v, timer, db, that){
  if ((allSnake[0].x).toFixed(2) >= v * 21 || (allSnake[0].x).toFixed(2) < 0 || (allSnake[0].y).toFixed(2) >= v * 22 || (allSnake[0].y).toFixed(2) < 0) {
    //如果是登录模式且是最高分把分数给数据库
    if(that.data.auth=='yes'){
      that.getOpenid();
    }
    //撞墙弹窗
    var pages = getCurrentPages();
    var perpage = pages[pages.length - 1]
    wx.showModal({
      title: '撞墙啦！',
      content: '重新开始游戏？',
      success: (res) => {
        if (res.confirm) {
          console.log("已经刷新页面")
          that.setData({
            allSnake: [],
            score: 0
          })
          perpage.onReady()
        }
      }
    })
    clearInterval(timer);

  };
}
