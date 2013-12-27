
module.exports = {
    plugins: {
        echo: function (options, done) {
            var text = options.text;
            setTimeout(function(){
                console.log(text);
                done();
            }, 100);
        },
        echo2 : {
            options: {

            },
            run: function (options, done) {
                var text = options.text;
                setTimeout(function(){
                    console.log(text);
                    done();
                }, 100);
            }
        }
    },
    tasks : {
        echo : {
            text: "hello modjs"
        },
        echo2 : {
            text: "hello modjs2"
        }
    },
    targets: {
        dist: "echo echo2"
    }
};