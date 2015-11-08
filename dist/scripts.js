"use strict";
angular.module("atwork.utils", ["ngRoute", "ngMaterial"]).factory("appStorage", function() {
    return {
        get: function(n) {
            return localStorage.getItem(n)
        },
        set: function(n, o) {
            return localStorage.setItem(n, o)
        },
        remove: function(n) {
            return localStorage.removeItem(n)
        }
    }
}).factory("appPromise", [
    function() {
        return function(n) {
            var o = Q.defer();
            return n(o), o.promise
        }
    }
]).factory("appLocation", ["$location",
    function(n) {
        return n
    }
]).factory("appWebSocket", [
    function(n) {
        var o = {
            conn: {},
            connect: function() {
                var n = this,
                    o = window.io();
                o.on("connect", function() {
                    console.log("Connected")
                }), o.on("disconnect", function() {
                    n.connect()
                }), this.conn = o
            },
            reconnect: function() {
                this.conn.close(), this.connect()
            },
            close: function() {
                this.conn.close()
            }
        };
        return o.connect(), o
    }
]).factory("appToast", ["$mdToast",
    function(n) {
        return function(o) {
            var t = n.simple().content(o).action("OK").highlightAction(!1).position("top right");
            n.show(t)
        }
    }
]).factory("appDialog", ["$mdDialog",
    function(n) {
        return n
    }
]).factory("appDesktop", ["$rootScope",
    function(n) {
        var o = 0,
            t = 0;
        return {
            notify: function(i) {
                o = void 0 !== i.notificationsCount ? i.notificationsCount : o, t = void 0 !== i.messagesCount ? i.messagesCount : t, n.badges = {
                    messageBadge: t
                }, window.fluid && (window.fluid.dockBadge = o + t, parseInt(window.fluid.dockBadge) <= 0 ? window.fluid.dockBadge = void 0 : (window.fluid.playSound("Sosumi"), window.fluid.playSound("Purr")))
            }
        }
    }
]).directive("setFocus", ["$timeout", "$parse",
    function(n, o) {
        return {
            link: function(t, i, e) {
                if ($(window).width() <= 600) return !0;
                var c = o(e.setFocus);
                t.$watch(c, function(o) {
                    o === !0 && n(function() {
                        i[0].focus()
                    }, 800)
                })
            }
        }
    }
]);
"use strict";
angular.module("atwork.system", ["ngRoute", "ngMessages", "ngResource", "angularFileUpload", "atwork.utils", "angular-loading-bar", "ngAnimate"]), angular.module("atwork.system").factory("tokenHttpInterceptor", ["appStorage",
    function(e) {
        return {
            request: function(r) {
                return r.headers.Authorization = "Bearer " + e.get("userToken"), r
            }
        }
    }
]).factory("appSearch", ["$resource",
    function(e) {
        var r = e("search/:keyword", {}, {
            query: {
                isArray: !1
            }
        });
        return function(e) {
            var t = r.query({
                keyword: e
            }).$promise;
            return t
        }
    }
]).config(["$httpProvider", "$mdThemingProvider", "cfpLoadingBarProvider",
    function(e, r, t) {
        e.interceptors.push("tokenHttpInterceptor"), r.definePalette("amazingPaletteName", {
            50: "ffebee",
            100: "ffcdd2",
            200: "ef9a9a",
            300: "e57373",
            400: "ef5350",
            500: "f44336",
            600: "e53935",
            700: "d32f2f",
            800: "c62828",
            900: "b71c1c",
            A100: "ff8a80",
            A200: "ff5252",
            A400: "ff1744",
            A700: "d50000",
            contrastDefaultColor: "light",
            contrastDarkColors: ["50", "100", "200", "300", "400", "A100"],
            contrastLightColors: void 0
        }), r.theme("default").primaryPalette("amazingPaletteName").accentPalette("amazingPaletteName"), t.includeSpinner = !0, t.includeBar = !1
    }
]);
"use strict";
angular.module("atwork.settings", []);
"use strict";
angular.module("atwork.settings").controller("SettingsCtrl", ["$scope", "$rootScope", "$routeParams", "$timeout", "appPosts", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket", "appUsersSearch", "appSettings",
    function(t, s, e, a, n, o, r, i, p, c, u, g) {
        g.fetch(function(s) {
            t.systemSettings = s
        }), -1 === o.getUser().roles.indexOf("admin") && (r("Only an Administrator can change system's settings."), p.url("/")), t.save = function(s) {
            var e = new g.single(t.systemSettings);
            e.$save(function(t) {
                t.success && (r("Your settings are saved."), p.url("/"))
            })
        }
    }
]);
"use strict";
angular.module("atwork.settings").config(["$routeProvider", "$locationProvider",
    function(t, e) {
        t.when("/settings", {
            templateUrl: "/system/settings/views/settings.html",
            controller: "SettingsCtrl"
        }), e.html5Mode(!0)
    }
]);
"use strict";
angular.module("atwork.settings").factory("appSettings", ["$resource", "$rootScope",
    function(t, e) {
        return {
            cache: {},
            single: t("system-settings/"),
            fetch: function(t) {
                var s = this,
                    n = s.single.get({}, function() {
                        for (var r in n.res.items) {
                            var i = n.res.items[r];
                            s.cache[i.name] = i.value
                        }
                        return e.systemSettings = s.cache, t ? t(s.cache) : !0
                    })
            }
        }
    }
]).factory("appSettingsValid", ["appSettings", "appLocation", "$rootScope",
    function(t, e, s) {
        return function() {
            return "/settings" === e.url() || "/logout" === e.url() || s.systemSettings && s.systemSettings.domains && s.systemSettings.workplace ? !0 : (e.url("/settings"), !1)
        }
    }
]);
"use strict";
angular.module("atwork.activities", ["atwork.system"]);
"use strict";
angular.module("atwork.chats", ["atwork.system"]);
"use strict";
angular.module("atwork.notifications", ["atwork.system"]).run(["$rootScope", "appLocation", "appNotification", "appWebSocket", "appNotificationText",
    function(o, t, n, i, a) {
        i.conn.on("notification", function(i) {
            o.$broadcast("notification", i), o.$broadcast(i.notificationType, i), i && (i.message = a(i).text, i.then = function() {
                i.postId ? t.url("/post/" + i.postId) : i.userId && t.url("/profile/" + i.actor.username)
            }, n.show(i))
        }), i.conn.on("system", function(t) {
            o.$broadcast(t.notificationType, t)
        })
    }
]);
"use strict";
angular.module("atwork.posts", ["atwork.system"]);
"use strict";
angular.module("atwork.streams", ["atwork.system"]);
"use strict";
angular.module("atwork.users", ["atwork.system"]).factory("appAuth", ["$http", "appStorage",
    function(e, r) {
        return {
            isLoggedIn: function() {
                return r.get("userToken")
            },
            getToken: function() {
                return r.get("userToken")
            },
            refreshUser: function(n) {
                e.get("/users/me").success(function(e) {
                    var t = angular.toJson(e.res.record);
                    r.set("user", t), n(e.res.record)
                })
            },
            getUser: function() {
                var e = r.get("user");
                return e ? angular.fromJson(e) : {
                    name: "unknown"
                }
            }
        }
    }
]);
"use strict";
angular.module("atwork.activities").controller("ActivitiesCtrl", ["$scope", "$rootScope", "$routeParams", "$timeout", "appPosts", "appActivities", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket",
    function(t, a, e, o, s, i, c, p, r, n, d) {
        t.lastUpdated = 0, t.newActivitiesCount = 0, t.actions = [];
        var u = e.userId,
            l = i.get({
                userId: u,
                timestamp: t.lastUpdated
            }, function() {
                t.actions = l.res.records ? l.res.records.concat(t.actions) : t.actions, t.lastUpdated = Date.now()
            })
    }
]);
"use strict";
angular.module("atwork.chats").controller("ChatsCtrl", ["$scope", "$rootScope", "$routeParams", "$timeout", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket", "appChats", "appDialog", "appDesktop",
    function(e, a, s, t, o, r, c, n, i, d, h, p) {
        e.chats = [], e.actions = {};
        var g = {}, u = function() {
                var a = 0;
                _.each(e.chats, function(e) {
                    a += e.unread
                }), p.notify({
                    messagesCount: a
                })
            };
        e.message = function(e, a, s) {
            var t;
            s ? (s.unread = 0, u(), t = {
                chatId: s._id
            }) : t = {
                participants: [a._id, o.getUser()._id]
            };
            var r = new d.single(t);
            r.$save(function(a) {
                var s = a.res.record._id;
                g[a.res.record._id] = a.res.record, h.show({
                    controller: ["$scope", "appDialog",
                        function(e, t) {
                            u(), e.messages = a.res.record.messages, e.chatId = s, e.firstTime = !0, e.$on("chatMessage", function(a, s) {
                                e.$apply(function() {
                                    e.messages.unshift(s.chatMessage)
                                }), i.conn.emit("markAccessed", {
                                    chatId: s.chatId,
                                    userId: o.getUser()._id
                                })
                            }), e.hide = function() {
                                t.hide()
                            }, e.sendMessage = function(a) {
                                if (a) {
                                    var s = e.message;
                                    e.message = "", d.single.message({
                                        message: s,
                                        creator: o.getUser()._id,
                                        _id: e.chatId
                                    }, function(a) {
                                        e.messages.unshift(a.res.record.messages[0])
                                    })
                                }
                            }
                        }
                    ],
                    templateUrl: "/modules/chats/views/chat-dialog.html",
                    targetEvent: e
                })["finally"](function() {
                    delete g[s]
                })
            })
        }, e.updateChats = function(a) {
            a = a || {};
            var s = d.single.get({}, function() {
                a.reload && (e.chats = []), s.res.records.length && (e.chats = a.append ? e.chats.concat(s.res.records) : s.res.records.concat(e.chats)), u(), e.noMoreChats = !s.res.morePages, e.lastUpdated = Date.now()
            })
        }, e.$on("chatMessage", function(a, s) {
            g[s.chatId] || e.updateChats({
                reload: !0
            })
        })
    }
]);
"use strict";
angular.module("atwork.notifications").controller("notificationsCtrl", ["$scope", "$rootScope", "appLocation", "appUsers", "appNotification", "appWebSocket", "appNotificationText", "appDesktop",
    function(i, t, o, n, a, s, c, f) {
        i.notificationShown = !1, i.notificationCount = 0, i.items = [], t.$on("notification", function(t, o) {
            i.updateNotifications()
        }), i.showUserNotifications = function(t) {
            i.notificationShown = !i.notificationShown
        }, i.markRead = function(t) {
            var o = n.notifications.get({
                notificationId: t._id
            }, function() {
                o.res.notifications && o.res.notifications.map(function(i) {
                    i.display = c(i)
                }), i.items = o.res.notifications, i.notificationCount = o.res.notifications.length
            });
            i.showUserNotifications()
        }, i.updateNotifications = function() {
            var t = n.notifications.get({}, function() {
                t.res.notifications && t.res.notifications.map(function(i) {
                    i.display = c(i), i.post ? i.href = "/post/" + i.post._id : i.user && (i.href = "/profile/" + i.actor.username)
                }), i.items = t.res.notifications, i.notificationCount = t.res.notifications ? t.res.notifications.length : 0, f.notify({
                    notificationsCount: i.notificationCount
                })
            })
        }, i.updateNotifications()
    }
]);
"use strict";
angular.module("atwork.posts").controller("PostsCtrl", ["$scope", "$route", "$rootScope", "$routeParams", "$timeout", "appPosts", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket", "appUsersSearch", "appPostsFeed", "resolvedFeeds",
    function(e, t, a, n, s, o, r, d, i, c, l, u, f, p) {
        function m(t) {
            var a = t.config || {};
            e.feedsFilter && !a.append && (e.feed = []), e.feed = a.append ? e.feed.concat(t.res.records) : t.res.records.concat(e.feed), e.noMorePosts = !t.res.morePages, e.lastUpdated = Date.now(), e.showBack = !1, e.feedTitle = e.timelinePage ? "Timeline" : e.streamPage ? "" : e.detailPage ? "Written by " + e.feed[0].creator.name : "Lobby"
        }
        e.content = "", e.lastUpdated = 0, e.postForm = "", e.newFeedCount = 0, e.feed = [], e.feedsFilter = "", e.limitComments = !0, e.feedPage = 0, e.showBack = !1, e.mentionsResults = [];
        var g = n.hashtag,
            F = (e.timelinePage = n.userId, e.detailPage = n.postId, e.streamPage = n.streamId);
        g && (e.feedsFilter = "#" + g), e.back = function() {
            history.go(-1)
        }, e.loadMore = function() {
            e.feedPage++, e.lastUpdated = 0, e.feed.push({
                spacer: !0
            }), e.updateFeed({
                append: !0
            })
        }, e.updateFeed = function(t, a) {
            var t = t || {};
            f.getFeeds(angular.extend(t, n, {
                passedData: a,
                feedsFilter: e.feedsFilter,
                limitComments: e.limitComments,
                feedPage: e.feedPage,
                lastUpdated: e.lastUpdated
            }), function(t) {
                angular.extend(e, t.config), m(t)
            })
        }, angular.extend(e, p.config), m(p);
        var P;
        e.$watch("feedsFilter", function(t, a) {
            t !== a && (e.feed = []), s.cancel(P), P = s(function() {
                t ? (e.noPosting = !0, e.updateFeed()) : e.feedsFilterEnabled && (e.lastUpdated = 0, e.noPosting = !1, e.updateFeed()), e.feedsFilterEnabled = "" !== e.feedsFilter
            }, 500)
        });
        var h = function(n, s) {
            if (s.streamId || t.current.params.streamId) {
                var o = t.current.params.streamId;
                o && o === s.streamId ? (e.newFeedCount++, e.$digest()) : a.$broadcast("stream-message", s)
            } else e.newFeedCount++, e.$digest()
        }, $ = function(t, a) {
                _.each(e.feed, function(t, s) {
                    t._id == a.postId && ! function(t) {
                        var s = {
                            postId: a.postId
                        };
                        if (e.detailPage && t._id === n.postId && (s.allowMarking = !0), t._id == a.postId) var r = o.single.get(s, function() {
                            angular.extend(t, r.res.record)
                        })
                    }(t)
                })
            };
        a.$on("like", $), a.$on("unlike", $), a.$on("comment", $), a.$on("feed", h), e.reset = function(t) {
            e.content = "", s(function() {
                e.postForm.$setPristine(), e.postForm.$setUntouched()
            })
        };
        var v = null;
        e.checkMentions = function(t, a) {
            if (t) {
                var n = /@([A-Za-z0-9_]+)$/g,
                    s = t.match(n);
                s && 1 === s.length && s[0].length >= 4 ? u(s[0].replace("@", ""), !1).then(function(t) {
                    e.mentionsResults = t.res.items
                }) : e.mentionsResults = [], v = a;
                var o = angular.element(v);
                angular.element(".mentions-results").css({
                    top: o.offset().top
                })
            }
        }, e.replaceName = function(t) {
            var a = /@([A-Za-z0-9_]+)$/g,
                n = angular.element(v);
            n.val(n.val().replace(a, "@" + t) + " "), s(function() {
                n.change(), n.focus(), e.mentionsResults = []
            })
        }, e.create = function(t, a) {
            if (t) {
                var n = new o.single({
                    content: this.content,
                    stream: F
                });
                n.$save(function(t) {
                    t.success ? (t.res = angular.extend(t.res, {
                        creator: r.getUser()
                    }), e.updateFeed(), e.reset()) : (e.failure = !0, d(t.res.message))
                })
            }
        }
    }
]);
"use strict";
angular.module("atwork.streams").controller("StreamsPurposeCtrl", ["$scope", "$rootScope", "$routeParams", "$timeout", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket", "appStreams",
    function(e, t, a, r, s, o, n, u, c, i) {
        var m = a.streamId;
        e.getStream = function(t) {
            var a = i.single.get({
                streamId: t
            }, function() {
                e.stream = a.res.record, e.stream.purpose = e.stream.purpose || "Set the stream's purpose here..."
            })
        }, e.updateStreamPurpose = function(t) {
            var a = i.single.get({
                streamId: m
            }, function() {
                a = angular.extend(a, e.stream), a.$save(function(e) {
                    o("Stream purpose updated.")
                })
            })
        }, m && e.getStream(m)
    }
]).controller("StreamsCtrl", ["$scope", "$rootScope", "$routeParams", "$timeout", "appAuth", "appToast", "appStorage", "appLocation", "appWebSocket", "appStreams",
    function(e, t, a, r, s, o, n, u, c, i) {
        e.streams = [], e.actions = {}, e.clearThis = function(t) {
            console.log(e), console.log(t), r(function() {}, 2e3)
        }, e.processMoreStreams = function(t) {
            r(function() {
                if ("1" === t) e.createNew();
                else var a = i.single.get({
                    streamId: t
                }, function() {
                    a.$subscribe({
                        streamId: t
                    }, function() {
                        e.updateStreams({
                            reload: !0
                        }), o("You have subscribed to the new stream."), u.url("/stream/" + t)
                    })
                })
            }, 500)
        }, e.unsubscribe = function(t) {
            var a = t._id,
                r = i.single.get({
                    streamId: a
                }, function() {
                    r.$unsubscribe({
                        streamId: a
                    }, function() {
                        e.updateStreams({
                            reload: !0
                        }), o("You have unsubscribed from that stream.")
                    })
                })
        }, e.updateStreams = function(t) {
            t = t || {};
            var a = i.single.get({
                subscribed: !0
            }, function() {
                t.reload && (e.streams = []), e.streams = t.append ? e.streams.concat(a.res.records) : a.res.records.concat(e.streams), e.noMoreStreams = !a.res.morePages, e.lastUpdated = Date.now()
            }),
                r = i.single.get({
                    unsubscribed: !0
                }, function() {
                    e.moreStreams = r.res.records
                })
        }, e.createNew = function() {
            e.actions.createNew = !0
        }, e.create = function(t) {
            if (t) {
                var a = new i.single({
                    title: this.newStreamName
                });
                a.$save(function(t) {
                    t.success ? (c.conn.emit("stream", t.res._id), e.actions.createNew = !1, e.updateStreams({
                        reload: !0
                    }), u.url("/stream/" + t.res._id)) : (e.failure = !0, o(t.res.message))
                })
            } else o("Bummer! Is the stream name good?")
        }, t.$on("stream-message", function(t, a) {
            angular.forEach(e.streams, function(e) {
                a.streamId === e._id && (e.unread = e.unread ? e.unread++ : 1)
            }), e.$digest()
        }), e.clearBadge = function(e) {
            e.unread = 0
        }, c.conn.on("stream", function() {
            o("Woot! There is a new stream available!"), e.updateStreams({
                reload: !0
            })
        }), e.updateStreams()
    }
]);
"use strict";
angular.module("atwork.users").controller("ActivationCtrl", ["$rootScope", "$scope", "$routeParams", "appUsers", "appToast", "appStorage", "appLocation",
    function(e, o, s, r, n, a, t) {
        var i = new r.auth({
            userId: s.userId,
            activationCode: s.activationCode
        });
        i.$save(function(e) {
            e.success ? (n("Yayy! Your account is now active!"), o.postLogin(e.res.record, e.res.token)) : n(e.res.message)
        }), o.postLogin = function(o, s) {
            var r = angular.toJson(o);
            a.set("user", r), a.set("userToken", s), e.$broadcast("loggedIn"), t.url("/")
        }
    }
]).controller("PasswordCtrl", ["$rootScope", "$scope", "$routeParams", "appUsers", "appToast", "appStorage", "appLocation",
    function(e, o, s, r, n, a, t) {
        var i = new r.auth({
            userId: s.userId,
            activationCode: s.activationCode
        });
        i.$save(function(e) {
            e.success ? (n("You are now logged in!"), o.postLogin(e.res.record, e.res.token)) : n(e.res.message)
        }), o.postLogin = function(o, s) {
            var r = angular.toJson(o);
            a.set("user", r), a.set("userToken", s), e.$broadcast("loggedIn"), t.url("/profile/" + o.username + "/change-password")
        }
    }
]).controller("SearchCtrl", ["$scope", "$routeParams", "$location", "$timeout", "$upload", "appUsers", "appAuth", "appToast", "appUsersSearch",
    function(e, o, s, r, n, a, t, i, u) {
        e.search = "", e.doSearch = function(e) {
            return u(e).then(function(e) {
                return e.res.items
            })
        }, e.goToUser = function(e) {
            e && e.username && s.url("/profile/" + e.username)
        }, e.clearSearch = function() {
            r(function() {
                e.search = ""
            }, 500)
        }
    }
]).controller("ProfileCtrl", ["$scope", "$routeParams", "$location", "$timeout", "$upload", "appUsers", "appAuth", "appToast", "appPosts", "profileData", "resolvedFeeds", "appPostsFeed", "appLocation",
    function(e, o, s, r, n, a, t, i, u, c, l, d, p) {
        function f(o) {
            var s = o.config || {};
            e.feedsFilter && !s.append && (e.feed = []), e.feed = s.append ? e.feed.concat(o.res.records) : o.res.records.concat(e.feed), e.noMorePosts = !o.res.morePages, e.lastUpdated = Date.now(), e.showBack = !1
        }
        var g = o.userId || t.getUser()._id;
        if (e.selfProfile = g === t.getUser()._id || g === t.getUser().username, !g) return s.url("/");
        e.editProfile = function() {
            e.editMode = !0
        }, e.changePassword = function() {
            p.url("/profile/" + t.getUser().username + "/change-password")
        }, e.cancelEditProfile = function() {
            e.editMode = !1
        }, e.updateProfile = function(o) {
            if (o) {
                if (e.password && e.password !== e.password2) return i("Passwords do not match.");
                var s = a.single.get({
                    userId: g
                }, function() {
                    s.name = e.profile.name, s.designation = e.profile.designation, e.password && (s.password = e.password), delete s.res, s.$update(function(o) {
                        o.success ? (e.editMode = !1, e.password && p.url("/profile/" + o.res.username)) : (e.failure = !0, i(o.res.message))
                    })
                })
            } else i("Something is missing.")
        };
        var m = function(o) {
            g = o.res.record.username, o.res.profile = o.res.record, angular.extend(e, o.res)
        };
        e.getProfile = function() {
            a.single.get({
                userId: g
            }).$promise.then(function(e) {
                m(e)
            })
        }, e.noPosting = !0, e.loadMore = function() {
            e.feedPage = e.feedPage || 0, e.feedPage++, e.lastUpdated = 0, e.feed.push({
                spacer: !0
            }), e.updateFeed({
                append: !0
            })
        }, e.updateFeed = function(s) {
            var s = s || {};
            d.getFeeds(angular.extend(s, o, {
                limitComments: !0,
                feedPage: e.feedPage
            }), function(o) {
                angular.extend(e, o.config), f(o)
            })
        }, e.follow = function() {
            e.alreadyFollowing = "";
            var o = new a.single({
                userId: g
            });
            o.$follow({
                userId: g
            }, function() {
                r(function() {
                    e.getProfile()
                }, 800)
            })
        }, e.unfollow = function() {
            e.alreadyFollowing = "";
            var o = new a.single({
                userId: g
            });
            o.$unfollow({
                userId: g
            }, function(o) {
                r(function() {
                    e.getProfile()
                }, 800)
            })
        }, e.$watch("avatar", function() {
            e.avatar && e.avatar.length && e.uploadAvatar(e.avatar)
        }), e.uploadAvatar = function() {
            if (!e.selfProfile) return !0;
            var o = e.avatar.pop();
            n.upload({
                url: "/users/" + g + "/avatar",
                file: o
            }).progress(function(e) {
                var o = parseInt(100 * e.loaded / e.total);
                console.log("progress: " + o + "% " + e.config.file.name)
            }).success(function(o, s, r, n) {
                o && o.success && (e.profile.face = o.res.face)
            })
        }, m(c), angular.extend(e, l.config), f(l)
    }
]).controller("InviteCtrl", ["$rootScope", "$scope", "appStorage", "appLocation", "appDialog", "appUsers", "appAuth", "appToast",
    function(e, o, s, r, n, a, t, i) {
        o.inviteOthers = function(e) {
            n.show({
                controller: ["$scope", "appDialog",
                    function(e, o) {
                        e.inviteDone = !1, e.doInvite = function(o) {
                            if (o) {
                                var s = t.getUser()._id,
                                    r = new a.single({
                                        userId: s,
                                        message: e.message,
                                        email: e.email,
                                        name: e.name
                                    });
                                r.$invite({
                                    userId: s
                                }, function(o) {
                                    o.success ? e.inviteDone = !0 : i(o.res.message)
                                })
                            }
                        }, e.hide = function() {
                            o.hide()
                        }
                    }
                ],
                templateUrl: "/modules/users/views/users-invite-dialog.html",
                targetEvent: e
            })
        }
    }
]).controller("LogoutCtrl", ["$rootScope", "appStorage", "appLocation",
    function(e, o, s) {
        o.remove("userToken"), o.remove("user"), e.$broadcast("loggedOut"), s.url("/login")
    }
]).controller("LoginCtrl", ["$scope", "$rootScope", "appUsers", "appAuth", "appToast", "appStorage", "appLocation", "appDialog",
    function(e, o, s, r, n, a, t, i) {
        e.reset = function() {
            e.name = e.email = e.password = e.password2 = e.name = ""
        }, e.create = function(o) {
            if (o) {
                var r = new s.single({
                    email: this.email,
                    name: this.name,
                    username: this.username,
                    designation: this.designation,
                    password: this.password
                });
                r.$save(function(o) {
                    e.registeredUserId = o.res._id, o.success ? o.res && o.res.record && o.res.record.active ? e.postLogin(o.res.record, o.res.token) : e.regDone = !0 : (e.failure = !0, n(o.res.message))
                })
            } else n("Something is missing.")
        }, e.resendEmail = function() {
            var o = new s.single({
                userId: e.registeredUserId
            });
            o.$activate({
                userId: e.registeredUserId
            }, function() {
                n("Success! An email has been sent to you again.")
            })
        }, e.forgotPwd = function(e) {
            i.show({
                controller: ["$scope", "appDialog",
                    function(e, o) {
                        e.inviteDone = !1, e.doReset = function(o) {
                            if (o) {
                                var r = new s.single({
                                    email: e.email
                                });
                                r.$resetPassword({
                                    email: e.email
                                }, function(o) {
                                    o.success ? e.submitDone = !0 : n(o.res.message)
                                })
                            }
                        }, e.hide = function() {
                            o.hide()
                        }
                    }
                ],
                templateUrl: "/modules/users/views/users-pwd-dialog.html",
                targetEvent: e
            })
        }, e.login = function(o) {
            if (o) {
                var r = new s.auth({
                    email: this.email,
                    password: this.password
                });
                r.$save(function(o) {
                    o.success ? (n("You are now logged in."), e.postLogin(o.res.record, o.res.token)) : n(o.res.message)
                })
            } else n("Something is missing.")
        }, e.postLogin = function(e, s) {
            var r = angular.toJson(e);
            a.set("user", r), a.set("userToken", s), o.$broadcast("loggedIn"), t.url("/")
        }, r.isLoggedIn() && t.url("/")
    }
]).controller("UserSheet", ["$scope", "$mdBottomSheet", "$location", "appStorage",
    function(e, o, s, r) {
        e.items = [{
            name: "Profile",
            icon: "fa-user",
            handler: function() {
                s.url("/profile/" + angular.fromJson(r.get("user")).username)
            }
        }, {
            name: "Logout",
            icon: "fa-sign-out",
            handler: function() {
                s.url("/logout")
            }
        }], e.listItemClick = function(s) {
            var r = e.items[s];
            o.hide(r), r.handler()
        }
    }
]);
"use strict";
angular.module("atwork.activities").factory("appActivities", ["$resource",
    function(e) {
        return e("activities/feed/:userId", {
            userId: "@_id"
        })
    }
]);
"use strict";
angular.module("atwork.chats").factory("appChats", ["$resource",
    function(a) {
        return {
            single: a("chats/:chatId/:action", {
                chatId: "@_id"
            }, {
                message: {
                    method: "POST",
                    params: {
                        action: "message"
                    }
                },
                end: {
                    method: "POST",
                    params: {
                        action: "end"
                    }
                }
            })
        }
    }
]);
"use strict";
angular.module("atwork.notifications").factory("appNotification", ["$resource", "$mdToast",
    function(t, o) {
        return {
            show: function(t) {
                if (t.message) {
                    var i = o.simple().content(t.message).action("VIEW").highlightAction(!1).position("bottom right");
                    o.show(i).then(function() {
                        t.then && t.then()
                    }), window.fluid && window.fluid.showGrowlNotification({
                        title: "Atwork",
                        description: t.message,
                        priority: 1,
                        sticky: !1,
                        identifier: "foo",
                        onclick: function() {},
                        icon: imgEl
                    })
                }
            }
        }
    }
]).factory("appNotificationText", [
    function() {
        return function(t) {
            if (!t) return {
                text: ""
            };
            var o = "",
                i = t.actor;
            switch (t.notificationType) {
                case "like":
                    o = i.name + " has liked a post";
                    break;
                case "comment":
                    o = i.name + " has commented on a post";
                    break;
                case "follow":
                    o = i.name + " is now following you";
                    break;
                case "mention":
                    o = i.name + " mentioned you in a post"
            }
            return {
                text: o
            }
        }
    }
]);
"use strict";
angular.module("atwork.posts").factory("appPosts", ["$resource",
    function(e) {
        return {
            single: e("posts/:postId/:action", {
                postId: "@_id"
            }, {
                like: {
                    method: "POST",
                    params: {
                        action: "like"
                    }
                },
                unlike: {
                    method: "POST",
                    params: {
                        action: "unlike"
                    }
                },
                comment: {
                    method: "POST",
                    params: {
                        action: "comment"
                    }
                },
                likes: {
                    method: "GET",
                    params: {
                        action: "likes"
                    }
                }
            }),
            feed: e("posts/"),
            stream: e("posts/stream/:streamId"),
            timeline: e("posts/timeline/:userId")
        }
    }
]).filter("appPostFormat", ["$sce",
    function(e) {
        return function(t) {
            var n = new RegExp("#([A-Za-z0-9]+)", "g");
            t = t.replace(n, function(e) {
                return '<a href="/feed/' + e.replace("#", "") + '">' + e + "</a>"
            });
            var o = new RegExp("@([A-Za-z0-9_]+)", "g");
            t = t.replace(o, function(e) {
                return '<a href="/profile/' + e.replace("@", "") + '">' + e + "</a>"
            });
            var i = [{
                key: ":)",
                value: "fa-smile-o"
            }, {
                key: ":|",
                value: "fa-meh-o"
            }, {
                key: ":(",
                value: "fa-frown-o"
            }, {
                key: "(y)",
                value: "fa-thumbs-o-up"
            }, {
                key: "(n)",
                value: "fa-thumbs-o-down"
            }, {
                key: ":+1",
                value: "fa-thumbs-up"
            }, {
                key: "(h)",
                value: "fa-heart"
            }, {
                key: "(i)",
                value: "fa-lightbulb-o"
            }],
                s = '<md-inline-list-icon class="yellow fa {{emoticon}}"></md-inline-list-icon>';
            for (var a in i) {
                var r = i[a].key,
                    l = i[a].value;
                t = t.replace(r, s.replace("{{emoticon}}", l))
            }
            return e.trustAsHtml(t)
        }
    }
]).factory("appPostsFeed", ["appPosts",
    function(e) {
        return {
            getFeeds: function(t, n) {
                function o(e) {
                    l.lastUpdated = Date.now(), e.config = l, n(e)
                }
                t = t || {};
                var i = t.userId,
                    s = (t.hashtag, t.postId),
                    a = t.streamId,
                    r = t.passedData,
                    l = t;
                if (i) {
                    l.noPosting = !0, l.limitComments = !0;
                    var m = e.timeline.get({
                        userId: i,
                        timestamp: l.lastUpdated,
                        filter: l.feedsFilter,
                        limitComments: l.limitComments,
                        page: l.feedPage
                    }, function() {
                        o(m)
                    })
                } else if (a) {
                    l.limitComments = !0;
                    var c = e.stream.get({
                        streamId: a,
                        timestamp: l.lastUpdated,
                        filter: l.feedsFilter,
                        limitComments: l.limitComments,
                        page: l.feedPage
                    }, function() {
                        o(c)
                    })
                } else if (s) {
                    l.noFiltering = !0, l.noPosting = !0, l.noMorePosts = !0, delete l.limitComments;
                    var m = e.single.get({
                        postId: s,
                        limitComments: l.limitComments,
                        allowMarking: !0
                    }, function() {
                        m.res.records = [m.res.record], o(m), l.lastUpdated = Date.now(), l.showBack = !0
                    })
                } else {
                    l.limitComments = !0;
                    var u = e.feed.get({
                        timestamp: l.lastUpdated,
                        filter: l.feedsFilter,
                        limitComments: l.limitComments,
                        page: l.feedPage
                    }, function() {
                        o(u)
                    })
                }
                r && o(r), l.newFeedCount = 0
            }
        }
    }
]).directive("awFeedItem", ["appPosts", "appWebSocket", "appAuth", "appDialog",
    function(e, t, n, o) {
        return {
            templateUrl: "/modules/posts/views/post-single.html",
            controller: ["$scope",
                function(t) {
                    t.doLike = function(t) {
                        t.liked = !0, e.single.like(t, function(e) {
                            angular.extend(t, e.res.record)
                        })
                    }, t.undoLike = function(t) {
                        t.liked = !1, e.single.unlike(t, function(e) {
                            angular.extend(t, e.res.record)
                        })
                    }, t.comment = function(t, o) {
                        if (t) {
                            var i = this.content;
                            o.commentEnabled = !1, o.comments.unshift({
                                creator: n.getUser(),
                                content: i
                            }), o.comment = i, e.single.comment(o, function(e) {
                                angular.extend(o, e.res.record), o.commentEnabled = !1
                            })
                        }
                    }, t.showLikers = function(t, n) {
                        e.single.likes({
                            postId: n._id
                        }, function(e) {
                            o.show({
                                controller: ["$scope", "appDialog",
                                    function(t, n) {
                                        t.users = e.res.records, t.hide = function() {
                                            n.hide()
                                        }
                                    }
                                ],
                                templateUrl: "/modules/users/views/users-dialog.html",
                                targetEvent: t
                            })
                        })
                    }
                }
            ]
        }
    }
]);
"use strict";
angular.module("atwork.streams").factory("appStreams", ["$resource",
    function(s) {
        return {
            single: s("streams/:streamId/:action", {
                streamId: "@_id"
            }, {
                subscribe: {
                    method: "POST",
                    params: {
                        action: "subscribe"
                    }
                },
                unsubscribe: {
                    method: "POST",
                    params: {
                        action: "unsubscribe"
                    }
                }
            })
        }
    }
]);
"use strict";
angular.module("atwork.users").factory("appUsers", ["$resource",
    function(r) {
        return {
            single: r("users/:userId/:action", {
                userId: "@_id"
            }, {
                update: {
                    method: "PUT"
                },
                follow: {
                    method: "POST",
                    params: {
                        action: "follow"
                    }
                },
                unfollow: {
                    method: "POST",
                    params: {
                        action: "unfollow"
                    }
                },
                activate: {
                    method: "POST",
                    params: {
                        action: "activate"
                    }
                },
                invite: {
                    method: "POST",
                    params: {
                        action: "invite"
                    }
                },
                resetPassword: {
                    method: "POST",
                    params: {
                        action: "resetPassword"
                    }
                }
            }),
            auth: r("users/authenticate"),
            notifications: r("users/notifications/:notificationId")
        }
    }
]).factory("appUsersSearch", ["$resource",
    function(r) {
        var e = r("users/search/:keyword", {}, {
            query: {
                isArray: !1
            }
        });
        return function(r, a) {
            var o = {
                keyword: r
            };
            a && (o.onlyUsernames = !0);
            var t = e.query(o).$promise;
            return t
        }
    }
]).factory("follow");
"use strict";
angular.module("atwork.activities").config(["$routeProvider", "$locationProvider",
    function(o, i) {
        i.html5Mode(!0)
    }
]);
"use strict";
angular.module("atwork.chats").config(["$routeProvider", "$locationProvider",
    function(o, r) {
        r.html5Mode(!0)
    }
]);
"use strict";

function resolvedFeeds(e) {
    return ["$route", "appPostsFeed", function(s, t) {
        var o = Q.defer(),
            l = angular.extend({
                limitComments: e.limitComments
            }, s.current.params);
        return t.getFeeds(l, function(e) {
            o.resolve(e)
        }), o.promise
    }]
}
angular.module("atwork.posts").config(["$routeProvider", "$locationProvider",
    function(e, s) {
        e.when("/feed", {
            templateUrl: "/modules/posts/views/feed.html",
            controller: "PostsCtrl",
            resolve: {
                resolvedFeeds: resolvedFeeds({
                    limitComments: !0
                })
            }
        }).when("/", {
            templateUrl: "/modules/posts/views/feed.html",
            controller: "PostsCtrl",
            resolve: {
                resolvedFeeds: resolvedFeeds({
                    limitComments: !0
                })
            }
        }).when("/post/:postId", {
            templateUrl: "/modules/posts/views/feed.html",
            controller: "PostsCtrl",
            resolve: {
                resolvedFeeds: resolvedFeeds({
                    limitComments: !1
                })
            }
        }).when("/feed/:hashtag", {
            templateUrl: "/modules/posts/views/feed.html",
            controller: "PostsCtrl",
            resolve: {
                resolvedFeeds: resolvedFeeds({
                    limitComments: !0
                })
            }
        }), s.html5Mode(!0)
    }
]);
"use strict";
angular.module("atwork.streams").config(["$routeProvider", "$locationProvider",
    function(e, r) {
        e.when("/stream/:streamId", {
            templateUrl: "/modules/posts/views/feed.html",
            controller: "PostsCtrl",
            resolve: {
                resolvedFeeds: ["$route", "appPostsFeed",
                    function(e, r) {
                        var t = Q.defer(),
                            o = angular.extend({
                                limitComments: !0
                            }, e.current.params);
                        return r.getFeeds(o, function(e) {
                            t.resolve(e)
                        }), t.promise
                    }
                ]
            }
        }), r.html5Mode(!0)
    }
]);
"use strict";
angular.module("atwork.users").config(["$routeProvider", "$locationProvider",
    function(e, r) {
        e.when("/login", {
            templateUrl: "/modules/users/views/login.html?v",
            controller: "LoginCtrl"
        }).when("/logout", {
            templateUrl: "/modules/users/views/login.html?v",
            controller: "LogoutCtrl"
        }).when("/activate/:userId/:activationCode", {
            templateUrl: "/modules/users/views/activating.html",
            controller: "ActivationCtrl"
        }).when("/changePassword/:userId/:activationCode", {
            templateUrl: "/modules/users/views/change-password.html",
            controller: "PasswordCtrl"
        }).when("/profile/:userId/change-password", {
            templateUrl: "/modules/users/views/change-password.html",
            controller: "ProfileCtrl",
            resolve: {
                profileData: ["$route", "appAuth", "appUsers",
                    function(e, r, t) {
                        var o = e.current.params,
                            s = o.userId || r.getUser()._id;
                        return t.single.get({
                            userId: s
                        }).$promise
                    }
                ],
                resolvedFeeds: ["$route", "appPostsFeed",
                    function(e, r) {
                        var t = Q.defer(),
                            o = angular.extend({
                                feedPage: 0
                            }, e.current.params);
                        return r.getFeeds(o, function(e) {
                            t.resolve(e)
                        }), t.promise
                    }
                ]
            }
        }).when("/profile/:userId", {
            templateUrl: "/modules/users/views/profile.html?v",
            controller: "ProfileCtrl",
            resolve: {
                profileData: ["$route", "appAuth", "appUsers",
                    function(e, r, t) {
                        var o = e.current.params,
                            s = o.userId || r.getUser()._id;
                        return t.single.get({
                            userId: s
                        }).$promise
                    }
                ],
                resolvedFeeds: ["$route", "appPostsFeed",
                    function(e, r) {
                        var t = Q.defer(),
                            o = angular.extend({
                                feedPage: 0
                            }, e.current.params);
                        return r.getFeeds(o, function(e) {
                            t.resolve(e)
                        }), t.promise
                    }
                ]
            }
        }).when("/me", {
            templateUrl: "/modules/users/views/profile.html?v",
            controller: "ProfileCtrl"
        }), r.html5Mode(!0)
    }
]);
var app = angular.module("AtWork", ["atwork.system", "atwork.users", "atwork.posts", "atwork.streams", "atwork.chats", "atwork.activities", "atwork.notifications", "atwork.settings", "ngMaterial"]);
app.controller("AppCtrl", ["$scope", "$route", "$rootScope", "$mdSidenav", "$mdBottomSheet", "$location", "$timeout", "appLocation", "appAuth", "appWebSocket", "appSettings", "appSettingsValid", "appToast",
    function(t, e, o, n, a, i, s, r, c, l, u, g, p) {
        t.barTitle = "", t.search = "", t.toggleSidenav = function(t) {
            n(t).toggle()
        }, t.updateLoginStatus = function() {
            t.isLoggedIn = c.isLoggedIn(), t.user = c.getUser()
        }, t.goHome = function() {
            r.url("/")
        }, t.showUserActions = function(e) {
            a.show({
                templateUrl: "/modules/users/views/user-list.html",
                controller: "UserSheet",
                targetEvent: e
            }).then(function(e) {
                t.alert = e.name + " clicked!"
            })
        };
        var d = function(t) {
            u.fetch(function(e) {
                o.systemSettings = e, t && t()
            })
        };
        t.$on("$routeChangeSuccess", function() {
            angular.element("*[md-scroll-y]").animate({
                scrollTop: 0
            }, 300), n("left").close()
        }), t.$on("loggedIn", function() {
            t.updateLoginStatus(), t.barTitle = "", t.$broadcast("updateNotifications"), l.conn.emit("online", {
                token: c.getToken()
            }), c.refreshUser(function(e) {
                t.user = e
            }), d(function() {
                t.$on("$routeChangeStart", function(t, e) {
                    var o = g();
                    o || p("Please complete the setup first.")
                }), t.appReady = !0, t.barTitle = o.systemSettings.tagline, s(g)
            })
        }), t.$on("loggedOut", function() {
            t.updateLoginStatus(), l.conn.emit("logout", {
                token: c.getToken()
            })
        }), l.conn.on("connect", function() {
            c.isLoggedIn() && l.conn.emit("online", {
                token: c.getToken()
            })
        }), t.updateLoginStatus(), s(function() {
            c.isLoggedIn() ? (t.barTitle = "", t.$broadcast("loggedIn")) : (-1 == window.location.href.indexOf("/activate/") && -1 == window.location.href.indexOf("/changePassword/") && r.url("/login"), d(), t.appReady = !0)
        })
    }
]);