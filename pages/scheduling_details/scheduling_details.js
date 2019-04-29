// pages/Order details/Order details.js
var app =getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:'',
    timeindex: 0,
    timearray: [],  //自定义时间数组
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      token: wx.getStorageSync('token')
    });
  },  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (){
    var that = this;
    var orderNo = app.orderNo; //订单号
    var orderStatus = app.orderStatus;  //订单状态
    that.setData({
      orderNo: orderNo,
      orderStatus: orderStatus,
    })
    // 请求订单详情内容
    wx.request({
      url: app.globalData.baseUrl + '/customerorder/detail/' + that.data.orderNo,
      method: 'get',
      header: {
        'content-Type': 'application/x-www-form-urlencoded',
        'auth-token': that.data.token
      },
      success: function (res) {
        console.log(res)
        timestamp1 = new Date(res.data.data[0].serviceStartTime);   //处理时间戳转换为时间格式
          y = timestamp1.getFullYear(),
          m = timestamp1.getMonth() + 1,
          d = timestamp1.getDate();
          // 前端展示用的格式
        var starttime = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + timestamp1.toTimeString().substr(0, 8);
        // 后台提交请求用的格式
        var starttimes = y + "年" + (m < 10 ? "0" + m : m) + "月" + (d < 10 ? "0" + d : d)+'日'
        that.setData({
          project: res.data.data[0],
          serviceStaffId: wx.getStorageSync('serviceStaffId'),
          starttime:starttime,
          starttimes: starttimes
        })
      }
    });
  },
  // 用户点击接受时的事件
  regist_accept:function () {
    var that = this;
    wx.showModal({
      cancelColor:'#333333',
      confirmText:'确认',
      cancelText: '取消',
      content:'确定接受此项排班?',
      confirmColor:'#5489FD',
      success(res){
        if (res.confirm){ //点击确认后发生请求
          wx.request({
            url: app.globalData.baseUrl + '/customerorderschedule/accept_schedule/' + that.data.orderNo,
            method: 'get',
            header:{
              'content-Type':'application/x-www-form-urlencoded',
              'auth-token': that.data.token
            },
            success: function (res) {
              console.log(res)
              if (res.data.code == 200){  //排班成功时弹出框提示内容
                wx.setStorageSync('current',1)
                wx.showModal({
                  showCancel:false,
                  confirmText: '我知道了',
                  title: '您已接受此项排班，请于'+that.data.starttimes+'到所在病区服务',
                  confirmColor: '#5489FD',
                  success(res) {
                    if (res.confirm) {   //如果用户点击取消返回首页
                      wx.switchTab({
                        url: '../index/index',
                      })
                    }
                  }
                })
              }else{  //返回code不为200时提示排班失败
                wx.showToast({
                  title: '接受失败',
                  icon: 'none',
                  duration: 1500,
                  success(res) {
                    setTimeout(function () {  //500毫秒后返回首页
                      wx.switchTab({
                        url: '../index/index',
                      })
                    }, 500);
                  }
                })
              }
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 用户拒绝此排班时的事件
  regist_pass: function () {
    var that = this;
    wx.showModal({
      cancelColor: '#333333',
      confirmText: '确认',
      cancelText: '取消',
      content: '真的要拒绝此项排班吗?',
      confirmColor: '#5489FD',
      success(res) {
        if (res.confirm) {  //点击确认后发生请求
          wx.request({
            url: app.globalData.baseUrl + '/customerorderschedule/refused_schedule/' + that.data.orderNo,
            method: 'get',
            header: {
              'content-Type': 'application/x-www-form-urlencoded',
              'auth-token': that.data.token
            },
            success: function (res) {
              console.log(res)
              if (res.data.code == 200) {  //返回code为200时表示拒绝成功
                wx.showToast({  //提示已拒绝的弹出框
                  title: '已拒绝',
                  icon: 'success',
                  duration:1500,
                  success(res){
                   setTimeout(function () { //2000毫秒后返回首页
                      wx.switchTab({
                        url: '../index/index',
                      })
                    },2000);
                  }
                })
              }
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('index---------onHide()')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorage({  //用户退出该页面时删除本地的这俩个值
      key:'serviceStaffId'  //服务id
    })
    wx.removeStorage({
      key: 'nurse_name',   //护工姓名S
    })
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