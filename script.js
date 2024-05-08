
    "use strict";
  
    
    var WeatherType;
    (function (WeatherType) {
        WeatherType["Cloudy"] = "Cloudy";
        WeatherType["Rainy"] = "Rainy";
        WeatherType["Stormy"] = "Stormy";
        WeatherType["Js"] = "Js";
        WeatherType["html"] = "html";
    })(WeatherType || (WeatherType = {}));
    const defaultPosition = () => ({
        left: 0,
        x: 0,
    });
    const N = {
        clamp: (min, value, max) => Math.min(Math.max(min, value), max),
        rand: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
    };
    const T = {
        format: (date) => {
            const hours = T.formatHours(date.getHours()),
                minutes = date.getMinutes(),
                seconds = date.getSeconds();
            return `${hours}:${T.formatSegment(minutes)}`;
        },
        formatHours: (hours) => {
            return hours % 12 === 0 ? 12 : hours % 12;
        },
        formatSegment: (segment) => {
            return segment < 10 ? `0${segment}` : segment;
        },
    };
    const LogInUtility = {
        verify: async (pin) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (pin === Default.PIN) {
                        resolve(true);
                    } else {
                        reject(`Invalid pin: ${pin}`);
                    }
                }, N.rand(300, 700));
            });
        },
    };
    const useCurrentDateEffect = () => {
        const [date, setDate] = React.useState(new Date());
        React.useEffect(() => {
            const interval = setInterval(() => {
                const update = new Date();
                if (update.getSeconds() !== date.getSeconds()) {
                    setDate(update);
                }
            }, 100);
            return () => clearInterval(interval);
        }, [date]);
        return date;
    };
    const ScrollableComponent = (props) => {
        const ref = React.useRef(null);
        const [state, setStateTo] = React.useState({
            grabbing: false,
            position: defaultPosition(),
        });
        const handleOnMouseDown = (e) => {
            setStateTo(
                Object.assign(Object.assign({}, state), {
                    grabbing: true,
                    position: {
                        x: e.clientX,
                        left: ref.current.scrollLeft,
                    },
                })
            );
        };
        const handleOnMouseMove = (e) => {
            if (state.grabbing) {
                const left = Math.max(0, state.position.left + (state.position.x - e.clientX));
                ref.current.scrollLeft = left;
            }
        };
        const handleOnMouseUp = () => {
            if (state.grabbing) {
                setStateTo(Object.assign(Object.assign({}, state), { grabbing: false }));
            }
        };
        return React.createElement(
            "div",
            { ref: ref, className: classNames("scrollable-component", props.className), id: props.id, onMouseDown: handleOnMouseDown, onMouseMove: handleOnMouseMove, onMouseUp: handleOnMouseUp, onMouseLeave: handleOnMouseUp },
            props.children
        );
    };
    const WeatherSnap = () => {
        const [temperature] = React.useState(N.rand(65, 85));
        return React.createElement(
            "span",
            { className: "weather" },
            React.createElement("i", { className: "weather-type", className: "fa-duotone fa-sun" }),
         
        );
    };
    const Reminder = () => {
        return React.createElement(
            "div",
            { className: "reminder" },
            React.createElement("div", { className: "reminder-icon" }, React.createElement("i", { className: "fa-regular fa-bell" })),
            React.createElement("span", { className: "reminder-text" }, " Contact on : ", React.createElement("span", { className: "reminder-time" }, "  "))
        );
    };
    const Time = () => {
        const date = useCurrentDateEffect();
        return React.createElement("span", { className: "time" }, T.format(date));
    };
    const Info = (props) => {
        return React.createElement("div", { id: props.id, className: "info" }, React.createElement("i", null), React.createElement(WeatherSnap, null));
    };
    const PinDigit = (props) => {
        const [hidden, setHiddenTo] = React.useState(false);
        React.useEffect(() => {
            if (props.value) {
                const timeout = setTimeout(() => {
                    setHiddenTo(true);
                }, 5000000);
                return () => {
                    setHiddenTo(false);
                    clearTimeout(timeout);
                };
            }
        }, [props.value]);
        return React.createElement("div", { className: classNames("app-pin-digit", { focused: props.focused, hidden }) }, React.createElement("span", { className: "app-pin-digit-value" }, props.value || ""));
    };
    const Pin = () => {
        const { userStatus, setUserStatusTo } = React.useContext(AppContext);
        const [pin, setPinTo] = React.useState("");
        const ref = React.useRef(null);
        React.useEffect(() => {
            if (userStatus === UserStatus.LoggingIn || userStatus === UserStatus.LogInError) {
                ref.current.focus();
            } else {
                setPinTo("");
            }
        }, [userStatus]);
        React.useEffect(() => {
            if (pin.length === 4) {
                const verify = async () => {
                    try {
                        setUserStatusTo(UserStatus.VerifyingLogIn);
                        if (await LogInUtility.verify(pin)) {
                            setUserStatusTo(UserStatus.LoggedIn);
                        }
                    } catch (err) {
                        console.error(err);
                        setUserStatusTo(UserStatus.LogInError);
                    }
                };
                verify();
            }
            if (userStatus === UserStatus.LogInError) {
                setUserStatusTo(UserStatus.LoggingIn);
            }
        }, [pin]);
        const handleOnClick = () => {
            ref.current.focus();
        };
        const handleOnCancel = () => {
            setUserStatusTo(UserStatus.LoggedOut);
        };
        const handleOnChange = (e) => {
            if (e.target.value.length <= 4) {
                setPinTo(e.target.value.toString());
            }
        };
        const getCancelText = () => {
            return React.createElement("span", { id: "app-pin-cancel-text", onClick: handleOnCancel }, "Cancel");
        };
        const getErrorText = () => {
            if (userStatus === UserStatus.LogInError) {
                return React.createElement("span", { id: "app-pin-error-text" }, "Invalid");
            }
        };
        return React.createElement(
            "div",
            { id: "app-pin-wrapper" },
            React.createElement("input", { disabled: userStatus !== UserStatus.LoggingIn && userStatus !== UserStatus.LogInError, id: "app-pin-hidden-input", maxLength: 4, ref: ref, type: "number", value: pin, onChange: handleOnChange }),
            React.createElement(
                "div",
                { id: "app-pin", onClick: handleOnClick },
                React.createElement(PinDigit, { focused: pin.length === 0, value: pin[0] }),
                React.createElement(PinDigit, { focused: pin.length === 1, value: pin[1] }),
                React.createElement(PinDigit, { focused: pin.length === 2, value: pin[2] }),
                React.createElement(PinDigit, { focused: pin.length === 3, value: pin[3] })
            ),
            React.createElement("h3", { id: "app-pin-label" }, "Enter PIN (000) ", getErrorText(), " ", getCancelText())
        );
    };
    const MenuSection = (props) => {
        const getContent = () => {
            if (props.scrollable) {
                return React.createElement(ScrollableComponent, { className: "menu-section-content" }, props.children);
            }
            return React.createElement("div", { className: "menu-section-content" }, props.children);
        };
        return React.createElement(
            "div",
            { id: props.id, className: "menu-section" },
            React.createElement("div", { className: "menu-section-title" }, React.createElement("i", { className: props.icon }), React.createElement("span", { className: "menu-section-title-text" }, props.title)),
            getContent()
        );
    };
    const QuickNav = () => {
        const getItems = () => {
            return [
                {
                    id: 1,
                    label: "email :ashishyesale007@gmail.com",
                },
                
               
            ].map((item) => {
                return React.createElement("div", { key: item.id, className: "quick-nav-item clear-button" }, React.createElement("span", { className: "quick-nav-item-label" }, item.label));
            });
        };
        return React.createElement(ScrollableComponent, { id: "quick-nav" }, getItems());
    };
    const Weather = () => {
        const getDays = () => {
            return [
                {
                    id: 1,
                    name: "HTML",

                    weather: WeatherType.html,
                },
                {
                    id: 2,
                    name: "Python",
                    weather: WeatherType.Cloudy,
                },
                 {
                    id: 3,
                    name: "  CSS",
                    weather: WeatherType.Rainy,
                },
                {
                    id: 4,
                    name: " R",
                    weather: WeatherType.Stormy,
                },               
                {
                    id: 5,
                    name: " JS",
                    weather: WeatherType.Js,
                },
               
               
            ].map((day) => {
                const getIcon = () => {
                    switch (day.weather) {
                        case WeatherType.Cloudy:
                            return "  fab fa-python ";
                        case WeatherType.Rainy:
                            return " fab fa-css3-alt";
                        case WeatherType.Stormy:
                            return " fa-brands fa-r-project";
                        case WeatherType.html:
                            return " fab fa-html5 ";
                        case WeatherType.Js:
                            return " fab fa-js-square ";
                    }
                };
                return React.createElement(
                    "div",
                    { key: day.id, className: "day-card" },
                    React.createElement(
                        "div",
                        { className: "day-card-content" },
                        React.createElement("span", { className: " " }, day.temperature, React.createElement("span", { className: "" }, " ")),
                        React.createElement("i", { className: classNames("day-weather-icon", getIcon(), day.weather.toLowerCase()) }),
                        React.createElement("span", { className: "day-name" }, day.name)
                    )
                );
            });
        };
        return React.createElement(MenuSection, { icon: "fa-solid fa-sun", id: "weather-section", scrollable: true, title: "  Programming Skills " }, getDays());
    };
    const Tools = () => {
        const getTools = () => {
            return [
                {
                    icon: "fa-solid fa-home 	 ",
                    id: 1,
                    image: " https://cdn.dribbble.com/users/3848091/screenshots/7339153/media/dbdf7c73224c5747cd71c0eba17b3240.gif" ,
                    label: "12th ",
                    name: " FIA ",
                },
                {
                    icon: "fa-solid fa-home ",
                    id: 2,
                    image: "  https://www.euroschoolindia.com/wp-content/uploads/2023/08/good-colleges.jpg",
                    label: " UG- b.tech CSE",
                    name: "  NMCOE , Sangli",
                },
                

            ].map((tool) => {
                const styles = {
                    backgroundImage: `url(${tool.image})`,
                };
                return React.createElement(
                    "div",
                    { key: tool.id, className: "tool-card" },
                    React.createElement("div", { className: "tool-card-background background-image", style: styles }),
                    React.createElement(
                        "div",
                        { className: "tool-card-content" },
                        React.createElement(
                            "div",
                            { className: "tool-card-content-header" },
                            React.createElement("span", { className: "tool-card-label" }, tool.label),
                            React.createElement("span", { className: "tool-card-name" }, tool.name)
                        ),
                        React.createElement("i", { className: classNames(tool.icon, "tool-card-icon") })
                    )
                );
            });
        };
        return React.createElement(MenuSection, { icon: "fa-solid fa-toolbox", id: "tools-section", title: "  EDUCATION  " }, getTools());
    };
    const Restaurants = () => {
        const getRestaurants = () => {
            return [
            {
                    desc: "    Desc 1 ",
                    id: 1,
                    image: " ",
                    title: " Title ",
                },
                {

                    desc: " Desc 2 ",
                    id: 2,
                    image: "  ",
                    title: " title 2",
                },
                

            ].map((restaurant) => {
                const styles = {
                    backgroundImage: `url(${restaurant.image})`,
                };
                return React.createElement(
                    "div",
                    { key: restaurant.id, className: "restaurant-card background-image", style: styles },
                    React.createElement(
                        "div",
                        { className: "restaurant-card-content" },
                        React.createElement(
                            "div",
                            { className: "restaurant-card-content-items" },
                            React.createElement("span", { className: "restaurant-card-title" }, restaurant.title),
                            React.createElement("span", { className: "restaurant-card-desc" }, restaurant.desc)
                        )
                    )
                );
            });
        };
        return React.createElement(MenuSection, { icon: "fa-regular fa-pot-food", id: "restaurants-section", title: " Work Experience " }, getRestaurants());
    };
    const Movies = () => {
        const getMovies = () => {
            return [

                {
                    desc: " I Use Photosh from last 4 years",
                    id: 2,
                    icon: "fa-solid fa-hat-wizard",
                    image: " https://play-lh.googleusercontent.com/r9zF77jorOmkaRlXnvsLiuVQ3p_gYW8y7x_UL-COoH9PxaTUEMbW1wiwS0z1n1Q31Q=w240-h480-rw",
                    title: " Adobe Photoshop ...",
                },
                {
                    desc: " I use Android studio from last 2 years working on Java and Kotlin Projects",
                    id: 2,
                    icon: "fa-solid fa-galaxy",
                    image: "   https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Android_Studio_Logo_%282023%29.svg/800px-Android_Studio_Logo_%282023%29.svg.png",
                    title: " Android Studio",
                },
                {
                    desc: " ",
                    id: 3,
                    icon: "fa-solid fa-broom-ball",
                    image: " https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZmMWsNXgSasMjyG5iJbTttUYQuTA0zyp53oJ8O9C1bg&s",
                    title: " figma",
                },
                {
                    desc: " ",
                    id: 4,
                    icon: "fa-solid fa-starship-freighter",
                    image: " ",
                    title: " ",
                },
            ].map((movie) => {
                const styles = {
                    backgroundImage: `url(${movie.image})`,
                };
                const id = `movie-card-${movie.id}`;
                return React.createElement(
                    "div",
                    { key: movie.id, id: id, className: "movie-card" },
                    React.createElement("div", { className: "movie-card-background background-image", style: styles }),
                    React.createElement(
                        "div",
                        { className: "movie-card-content" },
                        React.createElement("div", { className: "movie-card-info" }, React.createElement("span", { className: "movie-card-title" }, movie.title), React.createElement("span", { className: "movie-card-desc" }, movie.desc)),
                        React.createElement("i", { className: movie.icon })
                    )
                );
            });
        };
        return React.createElement(MenuSection, { icon: "fa-solid fa-camera-movie", id: "movies-section", scrollable: true, title: " Software Skills " }, getMovies());
    };
    const UserStatusButton = (props) => {
        const { userStatus, setUserStatusTo } = React.useContext(AppContext);
        const handleOnClick = () => {
            setUserStatusTo(props.userStatus);
        };
        return React.createElement(
            "button",
            { id: props.id, className: "user-status-button clear-button", disabled: userStatus === props.userStatus, type: "button", onClick: handleOnClick },
            React.createElement("i", { className: props.icon })
        );
    };
    const Menu = () => {
        return React.createElement(
            "div",
            { id: "app-menu" },
            React.createElement(
                "div",
                { id: "app-menu-content-wrapper" },
                React.createElement(
                    "div",
                    { id: "app-menu-content" },
                    React.createElement(
                        "div",
                        { id: "app-menu-content-header" },
                        React.createElement("div", { className: "app-menu-content-header-section" }, React.createElement(Info, { id: "app-menu-info" }), React.createElement(Reminder, null)),
                        //  React.createElement("img", {src: " ", height: "120px",  width: "100px"}, null)  # for image 

                     //   React.createElement("a", { id:"whatsapp-link" , className: "app-menu-content-header-section"  , href: " ", target: "_blank"}, React.createElement(UserStatusButton,  { icon: " # ", id: "sign-out-button", userStatus: UserStatus.LoggedOut }))
                    ),
                    React.createElement(QuickNav, null),

                    React.createElement(
                        "a",
                        { id: "link", className: "clear-button", href: " https://github.com/ashishyesale7", target: "_blank" },
                        React.createElement("i", { className: "fa-brands fa-github" }),

                        React.createElement("span", null, "GitHub")
                    ),

                    React.createElement(
                        "b",
                        { id: "link", className: "clear-button", href: " twitter.com/yesaleashish", target: "_blank" },
                        React.createElement("i", { className: "fa-brands fa-twitter" }),

                        React.createElement("span", null, "Twitter"),
                        
                     
                    ),

                       
                    React.createElement(
                        "c",
                        { id: "link", className: "clear-button", href: " http://linkedin.com/in/ashishyesale/", target: "_blank" },
                        React.createElement("i", { className: "fa-brands fa-linkedin" }),

                        React.createElement("span", null, "Linkedin"),
                        
                     
                    ),

                    React.createElement(Weather, null),
                    React.createElement(Restaurants, null),
                    React.createElement(Tools, null),
                    React.createElement(Movies, null)
                )
            )
        );
    };


    var UserStatus;
    (function (UserStatus) {
        UserStatus["LoggedIn"] = "Logged In";
        UserStatus["LoggingIn"] = "Logging Out";
        UserStatus["LoggedOut"] = "Logged In";
        UserStatus["LogInError"] = "Log In Error";
        UserStatus["VerifyingLogIn"] = "Verifying Log In";
    })(UserStatus || (UserStatus = {}));
    var Default;

    const Background = () => {
        const { userStatus, setUserStatusTo } = React.useContext(AppContext);
        const handleOnClick = () => {
            if (userStatus === UserStatus.LoggedOut) {
                setUserStatusTo(UserStatus.LoggingIn);
            }
        };
        return React.createElement("div", { id: "app-background", onClick: handleOnClick }, React.createElement("div", { id: "app-background-image", className: "background-image" }));
    };
    const Loading = () => {
        return React.createElement("div", { id: "app-loading-icon" }, React.createElement("i", { className: "fa-solid fa-spinner-third" }));
    };
    const AppContext = React.createContext(null);
    const App = () => {
        const [userStatus, setUserStatusTo] = React.useState(UserStatus.LoggedOut);
        const getStatusClass = () => {
            return userStatus.replace(/\s+/g, "-").toLowerCase();
        };
        return React.createElement(
            AppContext.Provider,
            { value: { userStatus, setUserStatusTo } },
            React.createElement(
                "div",
                { id: "app", className: getStatusClass() },
                React.createElement(Info, { id: "app-info" }),
                React.createElement(Pin, null),
                React.createElement(Menu, null),
                React.createElement(Background, null),
                React.createElement("div", { id: "sign-in-button-wrapper" }, React.createElement(UserStatusButton, { icon: "fa-solid fa-arrow-right-to-arc", id: "sign-in-button", userStatus: UserStatus.LoggingIn })),
                React.createElement(Loading, null)
            )
        );
    };
    ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
 
        

        
 
