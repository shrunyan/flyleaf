 'use strict';
/* globals page, $, Materialize, Render*/
var Display = function(data) {
    this.container = function () {
        var container = document.createElement('div');
            container.classList.add('container');
            container.add = function(node) {
                container.appendChild(node);
                return container;
            };
            return container;
    };
    this.textNode = function (string) {
        return document.createTextNode(string);
    };
    this.link = function (href, text) {
        var link = document.createElement('a');
            link.setAttribute('href', href);
            link.appendChild(this.textNode(text));
        return link;
    };


    var makeListItem = function (manga, imageID, detail) {
        var item = Render.li({
            classList: ['collection-item', 'avatar', 'waves-effect', 'waves-green'],
            id: manga._id,
            onclick: function () { page('/manga/' + this.id); }
        });

        var image = Render.img({
            classList: 'thumb-image',
            src: 'http://cdn.mangaeden.com/mangasimg/' + imageID,
            alt: manga.title
        });

        var title = Render.h6({
            classList: ['title', 'flow-text', 'truncate'],
            text: manga.title
        });

        item.add(image)
            .add(title);

        if (detail) {
            var details = document.createElement('p');
                details.classList.add('flow-text');
                details.innerHTML  = 'Author: ' + manga.author + '<br>' +
                // 'Artist: ' + manga.artist + '<br>' +
                'Latest Chapter: ' + manga.chapters_len;
            item.appendChild(details);
        }

        return item;
    };
    this.makeListItem = makeListItem;

    this.data = data;
    this.mainView = document.querySelector('.main-view');

    this.renderString = function (string) {
        $(window).scrollTop(0);
        this.mainView.innerHTML = string;
    };

    this.renderNode = function (node) {
        this.mainView.innerHTML = '';
        $(window).scrollTop(0);
        this.mainView.appendChild(node);
    };




    this.initLibrary = function () {  
        var main = Render.div();
        var listContainer = Render.ul({id: 'library', classList: 'collection'});
        var header = Render.div({classList: 'collection-header'})
                .add(Render.div({text:'My Library'}));

        main.add(header)
            .add(listContainer);

        this.renderNode(main);
    };




    this.search = { 
        init: function (callback) {
            // Render Form + Filters
            var formWrapper = Render.div({classList: 'form-wrapper'});
            var buttonGroup = Render.div({classList: 'button-group'});
            var collapsible = Render.ul({classList: 'collapsible', id: 'filter'})
                .set('data-collapsible', 'accordion');
            var inputField = Render.div({classList: 'input-field'});
            var searchForm = Render.form().add(inputField);
            var filters = Render.div({classList: 'filters'});
            var genre = Render.div({classList: 'genres'})
                .add(Render.h6({text: 'Genres'}));
            var genreLeft = Render.div({classList: 'genresLeft'});
            var genreRight = Render.div({classList: 'genresRight'});

            var newFilter = function (name) {
                return Render.p()
                    .add(Render.input({id: 'f'+name, type: 'checkbox', classList: 'filled-in'}))
                    .add(Render.label({'for': 'f'+name, text: name}));
            };

            data.getGenres(function (err, genres) {
                for (var i = 0; i < genres.length; i++) {
                    if (i%2 !== 0) genreRight.add(newFilter(genres[i])); 
                    else genreLeft.add(newFilter(genres[i]));
                }
            });

            inputField
                .add(Render.input({id: 'search', type: 'text', required: true}))
                .add(Render.label({'for': 'search'})
                    .add(Render.i({classList: 'mdi-action-search'})))
                .add(Render.div({classList: 'form-button'})
                    .add(Render.i({classList: 'mdi-content-send'})));

            collapsible
                .add(Render.li()
                    .add(Render.div({classList: 'collapsible-header'})
                        .add(Render.i({classList: 'mdi-content-filter-list'}))
                        .add(Render.text('Genre Filter')))
                    .add(Render.div({classList: 'collapsible-body'})
                        .add(filters
                            .add(genre
                                .add(genreLeft)
                                .add(genreRight)))))
                .add(Render.li()
                    .add(Render.div({classList: 'collapsible-header'})
                        .add(Render.i({classList: 'mdi-content-sort'}))
                        .add(Render.text('Sort')))
                    .add(Render.div({classList: 'collapsible-body'})
                        .add(Render.p()
                            .add(buttonGroup))));

            buttonGroup
                .add(Render.button({
                    classList: ['waves-effect', 'waves-light', 'green', 'btn'], 
                    innerHTML: 'POP &#x21F5'}))
                .add(Render.button({
                    classList: ['waves-effect', 'waves-light', 'green', 'btn'], 
                    innerHTML: 'A-Z &#x21F5'}));


            var header = Render.div({classList: 'collection-header'})
                    .add(Render.div({text:'Search'}));

            formWrapper
                .add(header)
                .add(searchForm)
                .add(collapsible);

            Render.view(formWrapper);
            $('#filter').collapsible();

            var screenHeight = $(window).innerHeight();

            var updateListView = function (extra) {
                var top = $(window).scrollTop() - extra;
                var bottom = top + screenHeight + extra;
                var items = $('.collection-item');

                for (var i = items.length - 1; i >= 0; i--) {
                    var windowOffset = parseInt(items[i].offsetTop) +250;

                    if (items[i].style.visibility !== '') {
                        if (windowOffset < top) continue;
                        if (windowOffset + items[i].offsetHeight > bottom) continue;
                        items[i].style.visibility = '';
                    } else if (items[i].style.visibility === '') {
                        if (windowOffset > top) continue;
                        if (items[i].offsetHeight < bottom) continue;
                        items[i].style.visibility = 'hidden';
                    }
                    // console.log(items[i].height);
                    // console.log('Top: ' + top, 'ItemOffset: ' + windowOffset, 'Bottom: ' + bottom);
                }
            };

            $( window ).scroll(function(event) {

                updateListView(150);
            });
            
            callback();
        },

        renderList: function (docs) {
            flyleaf.setID('searchCache', docs);
            var listContainer  = $('#results')[0];
            if (listContainer === undefined) {
                Render.node(Render.ul({id: 'results', classList: 'collection'}));
                listContainer  = $('#results')[0];
            }

            // || Render.ul({id: 'results', classList: 'collection'});
            // console.dir(docs);
            listContainer.innerHTML = '';

            var onclick = function () { page('/manga/' + this.id); };
            for (var i = 0; i <= docs.length - 1; i++) {
                var item = Render.li({
                    classList: ['collection-item', 'waves-effect', 'waves-green'],
                    id: docs[i]._id,
                    onclick: onclick
                });
                item.add(Render.h6({
                    classList: ['title', 'flow-text', 'truncate'],
                    text: docs[i].title
                }));

                // visibility: hidden;
                // item.style.visibility = 'hidden'; 
                listContainer.appendChild(item);
            }
            
            Render.node(listContainer);
             // Materialize.showStaggeredList('#results'); 
        }
    };





    this.manga = function(manga) {
        this.renderString('manga loaded');
        var main = Render.div();
        // start parallax

        var parallaxContainer = Render.div({classList: 'parallax-container'});
        var parallaxDiv = Render.div({classList: 'parallax'});
        var _image = Render.img({src: 'http://cdn.mangaeden.com/mangasimg/' + manga.image, classList: 'z-depth-5'});

        parallaxContainer
            .add(parallaxDiv
                .add(_image));

        main.add(parallaxContainer);

        // end parallax
        // start section

        var sectionDiv = Render.div({classList: ['container', 'white']});

        sectionDiv
            .add(Render.h3({text: manga.title}))
            .add(Render.h5({text: 'Author: ' + manga.author}))
            .add(Render.h5({text: 'Artist: ' + manga.artist}));

        //  start button

        var _saveString = 'Save';
        var _saveIconString = 'mdi-action-favorite-outline';
        if (data.checkLibrary(manga._id)) {
            _saveString = 'Saved';
            _saveIconString = 'mdi-action-favorite';
        } 

        var _saveBook = Render.button({
            classList: ['waves-effect', 'green', 'waves-light', 'btn'],
            text: _saveString,
            onclick: function () {
                var text = this.textContent;
                if (data.checkLibrary(manga._id)) {
                    // _saveBook.textContent = 'Already Saved!';
                } else {
                    data.saveBook(manga, function (err) {
                        if (err) text = 'ERROR: Could Not Save';
                        else text = 'Saved!';
                        _saveBook.textContent = text;
                    });
                }
            }
        });
        
        sectionDiv
            .add(_saveBook
                .add(Render.i({classList: [ _saveIconString, 'left' ]})));

        // End button
        

        // end section
        // start collapsible

        var collapsibleContainer = Render.ul({classList: 'collapsible'})
                .set('data-collapsible', 'accordion');


        var tagsCollapsibleHeader = Render.div({
            classList: ['collapsible-header', 'waves-effect', 'waves-green'],
            text: 'Tags'
        });
        var tagsCollapsibleBody = Render.div({classList: 'collapsible-body'});
        var _categories = Render.ul({classList: 'container'});
        for (var i = manga.categories.length - 1; i >= 0; i--) {
            _categories.add(Render.li({text:manga.categories[i]}));
        }
                
            
        collapsibleContainer
            .add(Render.li()
                .add(tagsCollapsibleHeader
                    .add(Render.i({classList: 'mdi-notification-more'})))
                .add(tagsCollapsibleBody
                    .add(_categories)));



        var summaryCollapsibleHeader = Render.div({
            classList: ['collapsible-header', 'waves-effect', 'waves-green'],
            text: 'Summary'
        });
        var summaryCollapsibleBody = Render.div({classList: 'collapsible-body'});
        var _description = Render.p({innerHTML: manga.description});

        collapsibleContainer
            .add(Render.li()
                .add(summaryCollapsibleHeader
                    .add(Render.i({classList: 'mdi-action-speaker-notes'})))
                .add(summaryCollapsibleBody
                    .add(_description)));

        var loadChapter = function () {
            flyleaf.data.readChapter(manga._id, this.index, 0);
            flyleaf.setID('chapterIndex', this.index);
            var chapterNumber = this.textContent.split(':')[0];
            flyleaf.display.setNavTitle(chapterNumber);
            
            page('/chapter/' + this.id);
        };

        var _chapters = Render.ul({classList: 'collection'});
            
        _chapters
            .add(Render.li({classList: 'collection-header'})
                .add(Render.h4({text: 'Chapters'})));
        for (var j = 0; j < manga.chapters.length; j++) {
            var label = (manga.chapters[j][2] === null || manga.chapters[j][2] === manga.chapters[j][0].toString()) ?
                'CH ' + manga.chapters[j][0] :
                'CH ' + manga.chapters[j][0] + ': ' + manga.chapters[j][2];

            var _chapterListItem = createElement('li');
            var _chapterDiv = document.createElement('div');
                _chapterDiv.appendChild(document.createTextNode(label));
            var _chapterA = document.createElement('a');
                _chapterA.classList.add('secondary-content');
            var _chapterIcon = document.createElement('i');

            if (manga.chapters[j][4] === undefined) {
                _chapterIcon.classList.add('mdi-action-bookmark-outline');
            } else if (parseInt(manga.chapters[j][4]) >= 0) {
                _chapterIcon.classList.add('mdi-action-bookmark');
            } else {
                _chapterIcon.classList.add('mdi-action-done');
            }
                _chapterA.appendChild(_chapterIcon);
                _chapterDiv.appendChild(_chapterA);
                _chapterListItem.appendChild(_chapterDiv);

                _chapterListItem.index = j;
                _chapterListItem.id = manga.chapters[j][3];
                _chapterListItem.onclick = loadChapter;
                _chapterListItem.classList.add('collection-item', 'waves-effect', 'waves-green');
            _chapters.appendChild(_chapterListItem);
        }

        main
            .add(sectionDiv)
            .add(collapsibleContainer)
            .appendChild(_chapters);

        Render.view(main);

        $(document).ready(function(){
          $('.parallax').parallax();
          $('.collapsible').collapsible();
        });


        function createElement (elem, text) {
            var element = document.createElement(elem);
            element.textContent = text;

            return element;
        }
    };

    this.chapter = function(chapterInfo) {
        // this.renderString('chapter loaded');
        var container = Render.div();
        // var images = '';

        for (var i = chapterInfo.images.length - 1; i >= 0; i--) {
            container
                .add(Render.img({
                    classList: ['page', 'responsive-img'],
                    src: 'http://cdn.mangaeden.com/mangasimg/' + chapterInfo.images[i][1] 
                }))
                .add(Render.br());
    
            // images += '<img class="page responsive-img" src="http://cdn.mangaeden.com/mangasimg/' + chapterInfo.images[i][1] + '"></img><br>';
        }
        // this.renderString(images);
        this.renderNode(container);
        
        var alreadyHit = false;
        var bottom = $(document).height() - 200;
        var currentPos = 0;
        var fullScreen = false;
        var $window = $(window);
        var $mainView = $('.main-view');
        var $images = $('.page');
        var stops = [];
        var setupPages = function () {
            var pages = [];
            for (var i = stops.length; i--; ) {
                pages[stops[i].index] = stops[i].height;
            }
            console.log(pages);
            var step = 0;
            for (var j = 0; j < stops.length; j+= 1 ) {
                step += pages[j];
                stops[j] = step;
            }
            console.log(stops, bottom);
            bottom = stops[stops.length -1];
            
            $window.scroll(checkScroll);
            $mainView.scroll(checkScroll);
            $('.main-view div > img').on('click', function () {
                toggleFullScreen($('.main-view')[0]);
            });
            console.log('Flyleaf: Pages: loaded');
        };
        
        var checkScroll = function() {
            currentPos = $(this).scrollTop() + $(this).height();
            console.log(currentPos, ' > ', bottom);
            
            if( currentPos > bottom) {
                console.log('hit bottom');
                if (alreadyHit) return;
                alreadyHit = true;
                var mangaID = flyleaf.getID('mangaID');
                var chapterIndex = flyleaf.getID('chapterIndex');
                data.readChapter(mangaID, chapterIndex, true);
            }
        };
        
        $images.each(function (index, elem) {
            $(elem).load(function () {
                stops.push({
                    index: index,
                    height: this.height
                });
                if (stops.length === $images.length) {
                    setupPages();
                }
            });
        });


            // if (isFullScreen()) {
            //     var windowPos = $window.scrollTop();
            //     console.log('Display:: is now fullScreen', 'window:', windowPos);
            //     console.log(mainView);
            //     console.log($mainView);
            //     $('.main-view').scrollTop(windowPos);
            // } else {
            //     var mainViewPos = $mainView.scrollTop();
            //     toggleFullScreen($('.main-view')[0]);
            //     console.log('Display:: is now normal', 'main-view:', mainViewPos);
            //     $(window).scrollTop(mainViewPos);
            // }
            // console.log('window:', windowPos, 'mainView:', mainViewPos);

    };

    this.startLoading = function (caller, process) {
        var string = caller + ':: Loading > ' + process;
        console.log(string);
        this.renderString(string);
    };

    this.endLoading = function (caller, process) {
        var string = caller + '::  Loaded < ' + process;
        console.log(string);
        this.renderString(string);
    };

    this.error = function (string) {
        this.renderString(string);
    };

    this.reveal = function (callback) {
        $('.center h5').delay(500).fadeIn();
        // $('.center .preloader-wrapper').delay(1000).fadeOut('slow');
        $('.cover').delay(1500).fadeOut('slow', callback);
    };

    this.setNavButton = function (type) {
        var button = $('.button-collapse');
        var icon = $('.button-collapse i');
        var backClass = 'mdi-navigation-chevron-left';
        var menuClass = 'mdi-navigation-menu';

        button.off('click');
        if (type === 'back') {
            icon.removeClass(menuClass);
            icon.addClass(backClass);
            button.on('click', function(event) {
                event.preventDefault();
                window.history.back();
            });
        } else if (type === 'menu') {
            icon.removeClass(backClass);
            icon.addClass(menuClass);
            button.sideNav({menuWidth: 240, activationWidth: 70, closeOnClick: true});
        }

    };

    this.setNavTitle = function (title) {
        title = title || 'Flyleaf.co';
        var navTitle = $('.nav-title');
        navTitle.text(title);
    };

    this.showLogin = function () {
        var login = function () {
            console.log(data);
        };

        var main = Render.div()
            .add(Render.div({classList: 'row', id: 'login'})
                .add(Render.div({classList: ['input-field', 'col', 's12']})
                    .add(Render.input({id:'email', type:'email', classList:'validate'}))
                    .add(Render.label({for: 'email', text: 'Email'}))
                    )

                .add(Render.div({classList: ['input-field', 'col', 's12']})
                    .add(Render.input({id: 'password', type: 'password'}))
                    .add(Render.label({for: 'password', text: 'Password'}))
                    )

                .add(Render.div({classList: ['input-field', 'col', 's6']})
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Sign In', id: 'signin'}))
                    )
                .add(Render.div({classList: ['input-field', 'col', 's6']})
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Sign Up', id: 'signup'}))
                    )

                .add(Render.div({classList: ['input-field', 'col', 's12']})
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Sign Out', id: 'signout'}))
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Save Library', id: 'pushLibrary'}))
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Refresh Library', id: 'pullLibrary'}))
                    )
                );

        Render.view(main);

        var toast = function (text) {
            Materialize.toast(text, 4000);
        };

        var auth = new Auth();

        var $email = $('#email');
        var $pass = $('#password');

        var $signin = $('#signin');
        var $signup = $('#signup');
        var $signout = $('#signout');
        var $pushLibrary = $('#pushLibrary');
        var $pullLibrary = $('#pullLibrary');


        $signin.on('click', function () {
            var email = $email.val();
            var pass = $pass.val();
            console.log(email, pass);
            auth.signIn(email, pass, function (err, authData) {
                if (err) {
                    toast('Sign In Error');
                    console.log(err);
                } else {
                    toast('Signed In');
                    console.log(authData);
                }
            });
        });

        $signout.on('click', function () {
            auth.signOut();
            toast('Signed Out');
        });

        $signup.on('click', function () {
            var email = $email.val();
            var pass = $pass.val();
            auth.signUp(email, pass, function (err, userData) {
                if (err) {
                    toast('Sign Up Unsuccessful');
                    console.log(err);
                } else {
                    toast('Sign Up Successful');
                    console.log(userData);
                }
            });
        });

        $pushLibrary.on('click', function () {
            data.pushLibrary(function (err) {
                if (err) {
                    toast('Error Saving Library');
                    console.log(err);
                } else {
                    toast('Library Saved');
                }
            });
        });

        $pullLibrary.on('click', function () {
            data.pullLibrary(function (err) {
                if (err) {
                    toast('Error Refreshing Library');
                    console.log(err);
                } else {
                    toast('Library Updated');
                }
            });
        });

    };
    
    this.loginModal = function () {
        
        var main = Render.div()
            .add(Render.form({classList: 'row', id: 'login'})
                .add(Render.h5({text: 'Login'}))
                .add(Render.div({classList: ['input-field', 'col', 's12']})
                    .add(Render.input({id:'email', type:'email', classList:'validate'}))
                    .add(Render.label({for: 'email', text: 'Email'}))
                    )
                .add(Render.div({classList: ['input-field', 'col', 's12']})
                    .add(Render.input({id: 'password', type: 'password'}))
                    .add(Render.label({for: 'password', text: 'Password'}))
                    )
                // .add(Render.div({classList: ['input-field', 'col', 's12', 'checkbox']})
                //     .add(Render.input({id: 'remember', type: 'checkbox', classList: 'filled-in'}))
                //     .add(Render.label({for: 'remember', text: 'Stay logged in?'}))
                //     )
                .add(Render.div({classList: ['input-field', 'col', 's6']})
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Sign In', id: 'signin'}))
                    )
                .add(Render.div({classList: ['input-field', 'col', 's6']})
                    .add(Render.button({
                        classList:['btn', 'green', 'waves-effect', 'waves-light'], 
                        text:'Sign Up', id: 'signup'}))
                    )
                );

        var footer = Render.a({
            id: 'nah',
            href: '',
            classList: [
                'modal-action',
                'modal-close',
                'waves-effect',
                'waves-green',
                'btn-flat'],
            text: 'Nah Im good'
        });
        
        var modal = Render.modal('authModal', main, footer);
        $('body').append(modal)
        
        $('#authModal').openModal();
        
        var toast = function (text) {
            console.log(text);
            Materialize.toast(text, 4000);
        };
        var auth = new Auth();

        var $email = $('#email');
        var $pass = $('#password');
        
        var $form = $('#login');
        var $signin = $('#signin');
        var $signup = $('#signup');
        var $nah = $('#nah');
        var unbind = function () {
            $form.off();
            $signin.off();
            $signup.off();
            $nah.off();
        };

        var signIn = function (e) {
            e.preventDefault();
            var email = $email.val();
            var pass = $pass.val();
            console.log(email, pass);
            auth.signIn(email, pass, function (err, authData) {
                if (err) {
                    toast('Sign In Error');
                    console.log(err);
                } else {
                    toast('Signed In');
                    unbind();
                    $('#authModal').closeModal();
                     data.pullLibrary(function (err) {
                        if (err) {
                            toast('Error Refreshing Library');
                            console.log(err);
                        } else {
                            toast('Library Updated');
                            flyleaf.myBooks();
                        }
                    });
                }
            });
        };
        
        $signin.on('click', signIn);
        $form.on('submit', signIn);
        
        $signup.on('click', function (e) {
            e.preventDefault();
            var email = $email.val();
            var pass = $pass.val();
            auth.signUp(email, pass, function (err, userData) {
                if (err) {
                    toast('Sign Up Unsuccessful');
                    console.log(err);
                } else {
                    toast('Sign Up Successful, Please Sign In');
                    $('#signup')
                        .off()
                        .addClass('disabled')
                        .removeClass('green');
                    console.log(userData);
                }
            });
        });

        $nah.on('click', function () {
            unbind();
            $('#authModal').closeModal();
            toast('Fine then! ( T-T)');
        });
    };
};

var isFullScreen = function () {
   return (document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen);
};

var toggleFullScreen = function (elem) {
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if ( isFullScreen() ) {
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};