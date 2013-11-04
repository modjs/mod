/*
 * Command suggestions
 * @see https://github.com/modulejs/modjs/issues/12
 */

module.exports = {

    threshold: 3,

    suggest: function (word, dictionary) {
        word = word.toLowerCase();
        return this.findClosestWord(word, dictionary);
    },

    findClosestWord: function (word, dictionary, distanceFunction) {
        var dist;
        var minDist = 99;
        var closestWord = null;

        if (!word || !dictionary) {
            return false;
        }
        if (!distanceFunction) {
            distanceFunction = this.sift3Distance;
        }

        for (var i = 0; i < dictionary.length; i++) {
            if (word === dictionary[i]) {
                return word;
            }
            dist = distanceFunction(word, dictionary[i]);
            if (dist < minDist) {
                minDist = dist;
                closestWord = dictionary[i];
            }
        }

        if (minDist <= this.threshold && closestWord !== null) {
            return closestWord;
        } else {
            return false;
        }
    },

    sift3Distance: function (s1, s2) {
        // sift3: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
        if (s1 == null || s1.length === 0) {
            if (s2 == null || s2.length === 0) {
                return 0;
            } else {
                return s2.length;
            }
        }

        if (s2 == null || s2.length === 0) {
            return s1.length;
        }

        var c = 0;
        var offset1 = 0;
        var offset2 = 0;
        var lcs = 0;
        var maxOffset = 5;

        while ((c + offset1 < s1.length) && (c + offset2 < s2.length)) {
            if (s1.charAt(c + offset1) == s2.charAt(c + offset2)) {
                lcs++;
            } else {
                offset1 = 0;
                offset2 = 0;
                for (var i = 0; i < maxOffset; i++) {
                    if ((c + i < s1.length) && (s1.charAt(c + i) == s2.charAt(c))) {
                        offset1 = i;
                        break;
                    }
                    if ((c + i < s2.length) && (s1.charAt(c) == s2.charAt(c + i))) {
                        offset2 = i;
                        break;
                    }
                }
            }
            c++;
        }
        return (s1.length + s2.length) / 2 - lcs;
    }
};