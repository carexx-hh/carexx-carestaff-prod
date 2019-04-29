// pages/mine/mine.js
const app = getApp()
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    show:false, //判断部分页面是否展示，初始值为false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    that.setData({
      token: wx.getStorageSync('token'),  //从本地拿到token存到data
     })
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
            var that=this;
            if (wx.getStorageSync('userInfo')){  //查看是否获取个人信息
            that.setData({
                show:false,
                userInfo: wx.getStorageSync('userInfo')
            })
        }else{
            that.setData({
                show:true
            })
        }
        // 请求护工的后台信息
        wx.request({
        url: app.globalData.baseUrl + '/inststaff/get_id',
        method: 'get',
        header: {
            'content-Type': 'application/x-www-form-urlencoded',
            'auth-token': that.data.token
        },
        success: function (res) {
            console.log(res)
            that.setData({
            info:res.data.data
            })
        }
        });
    },
  // 调用微信方法获取用户个人信息权限
  getUserInfo: function (e) {
    var that = this;
      wx.getUserInfo({
        lang: "zh_CN",
        success: res => {
        wx.setStorageSync('userInfo', res.userInfo)
        that.setData({
          userInfo:res.userInfo,
          show:false,
        })
        }
      })
  },
  // 查看护工具体的个人信息，跳转到个人信息页面
  click_details:function(){
     wx.navigateTo({
       url: '../personal_information/personal_information',
     })
  },
  // 跳转手机换绑功能
  click_phone:function(){
    wx.navigateTo({
        url: '../set_phone/set_phone',
    })
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

  }
})