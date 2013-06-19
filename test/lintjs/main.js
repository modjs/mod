define(function (require) {

    if(true) {
        // @keep
        alert(123);
    }
    true && alert( 123);
    /*
    @ignore
    */
    true, alert( 123);

    console.log(123);

    return {"作者":"元彦","version": VERSION}, alert(2);
});