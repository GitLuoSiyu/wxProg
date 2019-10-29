// miniprogram/pages/home/home.js
var db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userAvatar:'',
    userName:'',
    auth:'no',
    openid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  bindGetUserInfo: function (e) {
    console.log(e);
    this.setData({
      userAvatar:e.detail.userInfo.avatarUrl,
      userName: e.detail.userInfo.nickName,
      auth:'yes'
    })
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      console.log(this.data.auth)
    } else {
      //用户按了拒绝按钮
    }
  },

  
  
  navigateGame(){
    wx.navigateTo({
      url:'/pages/game/game'
    })
  },

  navigateGameInfo(){
    
    wx.navigateTo({
      url: '/pages/game/game?userAvatar=' + this.data.userAvatar + '&userName=' + this.data.userName + '&auth=' + this.data.auth

    })
  }
})
