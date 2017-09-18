/*
 Pushbullet
    Get and Send Push From Clipboard, Safari, Action Extension.
    Send:
         TodayWidget:
                     Clipboard
         ActionExtension:
                     File
    Get:
         TodayWidget or in App:
                     Note, Link, File
    Delete:
          One or All
    
  by Nicked 
     https://t.me/nicked
    */

timeout = 6
// 从 Today Widget启动
if ($app.env == $env.today) {
  var accesstoken = getToken()
  if (accesstoken) {
    // 执行 pushbullet
    pushbullet(accesstoken)
  } else {
    var message = {
      title: "Access Token Missing!",
      message: "Execute This Xteko In Pin App For More Information.",
      actions: [{
          title: "Open Pin",
          handler: function() {
            $app.openURL("pin://jslab")
          }
        },
        {
          title: "Cancel",
          handler: function() {
            $app.close()
          }
        }
      ]
    }
    $ui.alert(message)

  }

}
// 从应用内启动
if ($app.env == $env.app) {
  var accesstoken = getToken();
  if (accesstoken) {
    pushbullet(accesstoken)
  } else {
    settingToken()
  }
}
// 从 Action Entension 启动
if ($app.env == $env.action) {
  var accesstoken = getToken()
  if (accesstoken) {
    pushbulletAction(accesstoken)
  } else {
    settingToken()
  }
}
// 从 Safari 启动
if ($app.env == $env.safari) {
  var accesstoken = getToken()
  if (accesstoken) {
    pushbulletSafari(accesstoken)
  } else {
    settingToken()
  }
}

function pushbullet(accesstoken) {
  $ui.menu({
    items: ["Get Push", "Send Push", "Delete"],
    handler: function(title, idx) {
      if (idx == 0) {
        $ui.loading(true)
        $http.request({
          method: "GET",
          url: "https://api.pushbullet.com/v2/pushes?active=true",
          header: {
            "Access-Token": accesstoken
          },
          timeout: 1,
          handler: function(resp) {

            toast(resp)
            var push = resp.data.pushes
            if (push.length == 0) {
              $ui.alert("NO PUSHES!")
              $app.close()
            } else {
              $ui.menu({
                items: push.map(function(item) {
                  if (item.type == "note") {
                    return item.body
                  } else if (item.type == "link") {
                    mkd = "[" + item.body + "]" + "(" + item.url + ")"
                    if (item.title) {
                      return "🔗:" + item.title
                    } else {
                      return "🔗:" + mkd
                    }

                  } else {
                    var filename = item.file_url
                    return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)

                  }
                }),
                handler: function(title, idx) {
                  if (push[idx].type == "link") {

                    $clipboard.text = "[" + push[idx].body + "]" + "(" + push[idx].url + ")"
                    var title = "Link and Note Copied"

                    selectResult(title, $clipboard.text, push[idx].url)

                  } else if (push[idx].type == "note") {
                    $clipboard.text = push[idx].body
                    var link = $detector.link(push[idx].body)
                    if (link.length == 1) {
                      var title = "Note Copied"
                      var message = "Find 🔗: " + link
                      selectResult(title, message, link)

                    } else if (link.length > 1) {
                      $ui.toast("Links Dectected")
                      $ui.menu({
                        items: link,
                        handler: function(title, idx) {
                          $clipboard.text = link[idx]
                          var title = "Copied"
                          selectResult(title, link[idx], link[idx])
                        }
                      })
                    } else {
                      $ui.toast("Copied")
                    }

                  } else {
                    var title = "Pushbullet File"
                    var message = "Preview Or Copy URL"
                    var url = push[idx].file_url

                    selectResult(title, message, url, quicklook = 1)

                  }
                }

              })

            }

          }

        })

      } else if (idx == 1) {

        if ($clipboard.text == "") {
          $ui.alert("Clipboard is EMPTY!")
        } else {
          $ui.loading(true)
          $http.request({
            method: "POST",
            url: "https://api.pushbullet.com/v2/pushes",
            header: {
              "Access-Token": accesstoken
            },
            body: {
              type: "note",
              body: $clipboard.text
            },
            timeout: timeout,
            handler: function(resp) {
              toast(resp)
            }
          })

        }
      } else if (idx == 2) {
        $ui.alert({
          title: "Delete Confirm",
          message: "One Or All?",
          actions: [{
              title: "ONE",
              handler: function() {
                $ui.loading(true)
                $http.request({
                  method: "GET",
                  url: "https://api.pushbullet.com/v2/pushes?active=true",
                  header: {
                    "Access-Token": accesstoken
                  },
                  timeout: timeout,
                  handler: function(resp) {
                    toast(resp)
                    var push = resp.data.pushes
                    if (push.length == 0) {
                      $ui.alert("NO PUSHES!")
                      $app.close()
                    } else {
                      $ui.menu({
                        items: push.map(function(item) {
                          if (item.type == "note") {
                            return item.body
                          } else if (item.type == "link") {
                            mkd = "[" + item.body + "]" + "(" + item.url + ")"
                            if (item.title) {
                              return "🔗:" + item.title
                            } else {
                              return "🔗:" + mkd
                            }

                          } else {
                            var filename = item.file_url
                            return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)

                          }
                        }),
                        handler: function(title, idx) {
                          var iden = push[idx].iden

                          $http.request({
                            method: "DELETE",
                            url: "https://api.pushbullet.com/v2/pushes/" + iden,
                            header: {
                              "Access-Token": accesstoken
                            },
                            timeout: timeout,
                            handler: function(resp) {
                              toast(resp)
                            }

                          })
                        }

                      })

                    }

                  }

                })
              }
            }, {
              title: "ALL",
              handler: function() {
                $ui.loading(true)
                $http.request({
                  method: "DELETE",
                  url: "https://api.pushbullet.com/v2/pushes",
                  header: {
                    "Access-Token": accesstoken
                  },
                  timeout: timeout,
                  handler: function(resp) {
                    toast(resp)

                  }
                })

              }
            },
            {

              title: "Cancel",
              handler: function() {
                $app.close()
              }

            }
          ]
        })
      }
    }
  })
}

function pushbulletSafari(accesstoken) {
  $ui.loading(true)
  url = $context.safari.items.location.href
  $http.request({
    method: "POST",
    url: "https://api.pushbullet.com/v2/pushes",
    header: {
      "Access-Token": accesstoken
    },
    body: {
      type: "note",
      body: url
    },
    timeout: timeout,
    handler: function(resp) {
      toast(resp)
    }
  })
}

function pushbulletAction(accesstoken) {
  var file = $context.data
  $ui.toast("SETTING URL...")
  $ui.loading(true)
  file_name = file.fileName
  $http.request({
    method: "POST",
    url: "https://api.pushbullet.com/v2/upload-request",
    header: {
      "Access-Token": accesstoken,
    },
    body: {
      file_name: file_name
    },
    timeout: timeout,
    handler: function(resp) {
      toast(resp)
      var upload_url = resp.data.upload_url
      var file_url = resp.data.file_url
      if (file_url.indexOf("pushbulletusercontent.com/") != -1) {
        $ui.toast("file_url SUCCEEDED")
      } else {
        $ui.toast("file_url FAILED")
        $app.close()
      }
      $ui.toast("FILE UPLOADING...")
      $ui.loading(true)
      $http.request({
        method: "POST",
        url: upload_url,
        form: {
          file: file
        },
        timeout:30,
        handler: function(resp) {
          toast(resp)
          $http.request({
            method: "POST",
            url: "https://api.pushbullet.com/v2/pushes",
            header: {
              "Access-Token": accesstoken,
            },
            body: {
              type: "file",
              file_url: file_url,
              file_name: file_name,
            },
            timeout: timeout,
            handler: function(resp) {
              toast(resp)
              $context.close()
            }
          })

        }

      })
    }
  })
}

function getToken() {
  if ($file.exists("pushbullet.txt")) {
    var file = $file.read("pushbullet.txt")
    return file.string
  } else {
    return 0
  }
}

function toast(resp) {
  if (resp.response) {
    $ui.toast("REQUEST SUCCEEDED")
    $ui.loading(false)
  } else {
    $ui.toast("REQUEST TIMEOUT, TRY AGAIN LATER")
    $ui.loading(false)
  }

}

function selectResult(title, message, url, quicklook = 0) {
  $ui.alert({
    title: title,
    message: message,
    actions: [{
        title: "Preview",
        handler: function() {
          if (quicklook == 0) {
            $safari.open({
              url: url
            })
          } else {
            $ui.loading(true)
            $http.download({
              url: url,
              handler: function(resp) {
                $ui.loading(false)
                $quicklook.open({ data: resp.data })
              }
            })

          }

        }
      },
      {
        title: "Copy URL",

        handler: function() {
          $clipboard.text = url
        }
      },
      {
        title: "Cancel",
        handler: function() {
          $app.close()
        }
      }
    ]
  })
}

function settingToken() {
  $ui.render({
    props: {
      title: "Pushbullet"
    },
    views: [{
        type: "text",
        props: {
          id: "message",
          text: "\n\n\nYou need the access token in order to use the API.\nUsing an access token grants full access to your account. Don't share this lightly.",
          //align: $align.center,
          font: $font(16),
          editable: 0
        },
        layout: function(make) {
          make.left.top.right.inset(5)
          make.height.equalTo(200)
        }
      },
      {
        type: "input",
        props: {
          id: "accesstoken",
          placeholder: "Paste Your Access Token",
          align: $align.center,
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("message")
          make.top.equalTo(preView.bottom).inset(100)
          make.left.right.inset(10)
          make.height.equalTo(30)
        }
      },
      {
        type: "button",
        props: {
          id: "submit",
          title: "Submit",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("accesstoken")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            handleButtonSubmit()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "register",
          title: "Create Access Token on Pushbullet.com",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("submit")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            $app.openURL("https://www.pushbullet.com/#settings/account")
          }
        }
      },
      {
        type: "button",
        props: {
          id: "setting",
          title: "More Information",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("register")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            $ui.preview({
              url: "http://telegra.ph/PushbulletAccessToken-09-17"
            })
          }
        }
      }
    ]
  })
}

function handleButtonSubmit() {
  var accesstoken = $("accesstoken").text
  if (accesstoken == '') {
    $ui.toast("Input Access Token.")
  } else {
    $ui.loading(true)
    $http.request({
      method: "GET",
      url: "https://api.pushbullet.com/v2/pushes?active=true",
      header: {
        "Access-Token": accesstoken
      },
      timeout: timeout,
      handler: function(resp) {

        $ui.loading(false)
        if (resp.response) {
          $ui.toast("VERIFYING SUCCEEDED")
          $("message").text = "\n\n\n\nAccess Token Checked!."
          $file.write({
            data: $data({
              string: accesstoken
            }),
            path: "pushbullet.txt"
          })
          $("accesstoken").blur()
        } else {
          $("accesstoken").text = ""
          $ui.toast("Wrong Access Token! Try Again!")
          $("accesstoken").focus()
        }
      }
    })
  }
}