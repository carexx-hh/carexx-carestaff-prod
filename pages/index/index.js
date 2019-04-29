// pages/order/order.js
const util = require('../../utils/util.js')
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchtab: [   //头部tab状态
        {
        name: '待接受',
        },
        {
        name: '进行中',
        }
    ],
    current:0,  // 0为待接受，1为进行中
    coupons:[],  //列表初始值
    show:false    //在没有数据状态下显示的页面内容，初始设置为false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  },
  // 点击不同状态请求俩个状态下的数据
  switchNav: function (e){
    var that = this;
    this.setData({
        coupons:[]
    })
    var index = e.target.dataset.index;
    wx.setStorageSync('current', index)  //保存到本地做页面返回时的监测
    that.setData({
        current: index
    },function(){
      if(that.data.current==0){ //如果选择待接受时发生的请求
        wx.request({
          url: app.globalData.baseUrl + '/customerorder/by_orderStatus_and_serviceStatus',
          method: 'post',
          data: {
            serviceStatus: 3,
            serviceStaffId: wx.getStorageSync('serviceStaffId')
          },
          header: {
            'content-Type': 'application/x-www-form-urlencoded',
            'auth-token': wx.getStorageSync('token')
          },
          success: function (res) {
            console.log(res)
            if (res.data.data.length == 0){  //返回数据为空时show为true
              that.setData({
                show: true
              })
              return;
            } 
            var timestamp = [];    //自定义数组（处理时间用）
            var arr = [];   //自定义数组
            for (var i = 0; i < res.data.data.length; i++) {
              timestamp.push(new Date(res.data.data[i].createTime));    //把所有数据中的时间循环并保存到该数组
            }
            for (var j = 0; j < timestamp.length; j++) {
                y = timestamp[j].getFullYear(),
                m = timestamp[j].getMonth() + 1,
                d = timestamp[j].getDate();
            arr.push(y + '.' + (m < 10 ? "0" + m : m) + "." + (d < 10 ? "0" + d : d));  //经过处理分为年月日再次存到arr数组
            }
            var newtime = new Date().toDateString()
            that.setData({
              coupons: res.data.data,
              time: arr,
              show: false
            })
          }
        });
      } else if (that.data.current == 1) {   //如果选择进行中时发生的请求
        wx.request({
          url: app.globalData.baseUrl + '/customerorder/staff_by_orderStatus_and_serviceStatus',
          method: 'post',
          data: {
            orderStatus: 4,
            serviceStatus: 1,
            serviceStaffId: wx.getStorageSync('serviceStaffId')
          },
          header: {
            'content-Type': 'application/x-www-form-urlencoded',
            'auth-token': wx.getStorageSync('token')
          },
          success: function (res) {
            console.log(res)
            if (res.data.data.length == 0) {    //这里的逻辑处理同上（不同状态下请求数据后的处理）
              that.setData({ 
                show: true
              })
            } else {
              that.setData({
                show: false
              })
            }
            var timestamp = [];
            var arr = [];
            for (var i = 0; i < res.data.data.length; i++) {   //这里的逻辑处理和在待接受时进行的逻辑处理一样
              timestamp.push(new Date(res.data.data[i].createTime));
            }
            for (var j = 0; j < timestamp.length; j++) {
            y = timestamp[j].getFullYear(),
                m = timestamp[j].getMonth() + 1,
                d = timestamp[j].getDate();
            arr.push(y + '.' + (m < 10 ? "0" + m : m) + "." + (d < 10 ? "0" + d : d));
            }
            var newtime = new Date().toDateString()
            that.setData({
              coupons: res.data.data,
              time: arr,
            });
      }
    });
  }
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
  // 待接收：4 3 2
  // 进行中： 4 1 2
  onShow: function () {
    var that = this;
    wx.login({
      success: res =>{
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.request({   //code获取成功时请求token
            url: app.globalData.baseUrl + '/auth/caregivers_login',
            method: 'POST',
            data: {
              code: res.code,
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            success: function (res) {
              console.log(res)
              wx.setStorageSync('serviceStaffId', res.data.data.serviceStaffId) 
              wx.setStorageSync('openId', res.data.data.openId)  //获取到openID保存到本地
              if (res.data.data.certificationStatus == 2){  //若果登陆状态返回2时执行以下操作
                wx.setStorage({  //保存token到本地
                  key: 'token',
                  data: res.data.data.token,
                  success(res){
                    if (!wx.getStorageSync('current')||wx.getStorageSync('current')==0){
                      that.setData({          //如果本地没有current这个值或这个值为0就默认为0
                        current: 0
                      })
                      //在登录状态为2且是待接受状态下请求数据
                    wx.request({
                      url: app.globalData.baseUrl + '/customerorder/by_orderStatus_and_serviceStatus',
                      method: 'post',
                      data: {
                        serviceStatus:3,
                        serviceStaffId: wx.getStorageSync('serviceStaffId')
                      },
                      header: {
                        'content-Type': 'application/x-www-form-urlencoded',
                        'auth-token': wx.getStorageSync('token')
                      },
                      success: function (res) {
                        console.log(res)
                        if (res.data.data.length == 0) {  //返回数据为空时show为true
                          that.setData({
                            show:true
                          })
                        }
                        var timestamp = [];  //自定义数组（存放时间戳）
                        var arr = [];
                        for (var i = 0; i < res.data.data.length; i++) {
                          timestamp.push(new Date(res.data.data[i].createTime));
                        }
                        for (var j = 0; j < timestamp.length; j++) {
                            y = timestamp[j].getFullYear(),
                            m = timestamp[j].getMonth() + 1,
                            d = timestamp[j].getDate();
                            // 时间戳准换为时间格式保存到arr数组
                        arr.push(y + '.' + (m < 10 ? "0" + m : m) + "." + (d < 10 ? "0" + d : d));
                        }
                        console.log(arr)
                        that.setData({
                          coupons: res.data.data,
                          time: arr,
                        })
                      }
                    });
                    // 本地没有current或者current为1时执行的操作
                    }else if(wx.getStorageSync('current') && wx.getStorageSync('current') == 1) {
                      that.setData({
                        current:1
                      })
                      wx.request({   //在登录状态为2时且是进行中时发生的请求
                        url: app.globalData.baseUrl + '/customerorder/staff_by_orderStatus_and_serviceStatus',
                        method: 'post',
                        data: {
                          orderStatus: 4,
                          serviceStatus: 1,
                          serviceStaffId: wx.getStorageSync('serviceStaffId')
                        },
                        header: {
                          'content-Type': 'application/x-www-form-urlencoded',
                          'auth-token': wx.getStorageSync('token')
                        },
                        success: function (res) {
                          console.log(res)
                          if (res.data.data.length == 0) { //返回数据为空时show为true
                            that.setData({
                              show: true
                            })
                          }
                          var timestamp = [];   //自定义数组（存放时间戳）
                          var arr = [];
                          for (var i = 0; i < res.data.data.length; i++) {
                            timestamp.push(new Date(res.data.data[i].createTime));
                          }
                            for (var j = 0; j < timestamp.length; j++) {  // 时间戳准换为时间格式保存到arr数组
                                y = timestamp[j].getFullYear(),
                                m = timestamp[j].getMonth() + 1,
                                d = timestamp[j].getDate();
                                arr.push(y + '.' + (m < 10 ? "0" + m : m) + "." + (d < 10 ? "0" + d : d));
                            }
                          that.setData({
                            coupons: res.data.data,
                            time: arr,
                          })
                        }
                      });
                    }
                  }
                })
              } else {  //否则登录状态不为2时跳转到登录界面要求护工登录绑定
                wx.redirectTo({
                  url: '../login/login',
                })
              }
            },
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  // 点击列表发生的事件，跳转到排班详情页面
  clickDetails: function(e){
    var that=this;
    var orderNo = e.currentTarget.dataset.orderno  //订单号
    app.orderNo = orderNo; 
    var orderStatus = e.currentTarget.dataset.orderstatus   //订单状态
    app.orderStatus = orderStatus;
    wx.setStorageSync('current', that.data.current)   //并把current状态存到本地，页面返回时监测要跳到哪个状态下
    wx.navigateTo({
      url: '../scheduling_details/scheduling_details',
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