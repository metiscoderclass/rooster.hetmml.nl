(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.remove = removeDiacritics;

var replacementList = [
  {
    base: ' ',
    chars: "\u00A0",
  }, {
    base: '0',
    chars: "\u07C0",
  }, {
    base: 'A',
    chars: "\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F",
  }, {
    base: 'AA',
    chars: "\uA732",
  }, {
    base: 'AE',
    chars: "\u00C6\u01FC\u01E2",
  }, {
    base: 'AO',
    chars: "\uA734",
  }, {
    base: 'AU',
    chars: "\uA736",
  }, {
    base: 'AV',
    chars: "\uA738\uA73A",
  }, {
    base: 'AY',
    chars: "\uA73C",
  }, {
    base: 'B',
    chars: "\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0181",
  }, {
    base: 'C',
    chars: "\u24b8\uff23\uA73E\u1E08\u0106\u0043\u0108\u010A\u010C\u00C7\u0187\u023B",
  }, {
    base: 'D',
    chars: "\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018A\u0189\u1D05\uA779",
  }, {
    base: 'Dh',
    chars: "\u00D0",
  }, {
    base: 'DZ',
    chars: "\u01F1\u01C4",
  }, {
    base: 'Dz',
    chars: "\u01F2\u01C5",
  }, {
    base: 'E',
    chars: "\u025B\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E\u1D07",
  }, {
    base: 'F',
    chars: "\uA77C\u24BB\uFF26\u1E1E\u0191\uA77B",
  }, {
    base: 'G',
    chars: "\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E\u0262",
  }, {
    base: 'H',
    chars: "\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D",
  }, {
    base: 'I',
    chars: "\u24BE\uFF29\xCC\xCD\xCE\u0128\u012A\u012C\u0130\xCF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197",
  }, {
    base: 'J',
    chars: "\u24BF\uFF2A\u0134\u0248\u0237",
  }, {
    base: 'K',
    chars: "\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2",
  }, {
    base: 'L',
    chars: "\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780",
  }, {
    base: 'LJ',
    chars: "\u01C7",
  }, {
    base: 'Lj',
    chars: "\u01C8",
  }, {
    base: 'M',
    chars: "\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C\u03FB",
  }, {
    base: 'N',
    chars: "\uA7A4\u0220\u24C3\uFF2E\u01F8\u0143\xD1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u019D\uA790\u1D0E",
  }, {
    base: 'NJ',
    chars: "\u01CA",
  }, {
    base: 'Nj',
    chars: "\u01CB",
  }, {
    base: 'O',
    chars: "\u24C4\uFF2F\xD2\xD3\xD4\u1ED2\u1ED0\u1ED6\u1ED4\xD5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\xD6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\xD8\u01FE\u0186\u019F\uA74A\uA74C",
  }, {
    base: 'OE',
    chars: "\u0152",
  }, {
    base: 'OI',
    chars: "\u01A2",
  }, {
    base: 'OO',
    chars: "\uA74E",
  }, {
    base: 'OU',
    chars: "\u0222",
  }, {
    base: 'P',
    chars: "\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754",
  }, {
    base: 'Q',
    chars: "\u24C6\uFF31\uA756\uA758\u024A",
  }, {
    base: 'R',
    chars: "\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782",
  }, {
    base: 'S',
    chars: "\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784",
  }, {
    base: 'T',
    chars: "\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786",
  }, {
    base: 'Th',
    chars: "\u00DE",
  }, {
    base: 'TZ',
    chars: "\uA728",
  }, {
    base: 'U',
    chars: "\u24CA\uFF35\xD9\xDA\xDB\u0168\u1E78\u016A\u1E7A\u016C\xDC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244",
  }, {
    base: 'V',
    chars: "\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245",
  }, {
    base: 'VY',
    chars: "\uA760",
  }, {
    base: 'W',
    chars: "\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72",
  }, {
    base: 'X',
    chars: "\u24CD\uFF38\u1E8A\u1E8C",
  }, {
    base: 'Y',
    chars: "\u24CE\uFF39\u1EF2\xDD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE",
  }, {
    base: 'Z',
    chars: "\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762",
  }, {
    base: 'a',
    chars: "\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250\u0251",
  }, {
    base: 'aa',
    chars: "\uA733",
  }, {
    base: 'ae',
    chars: "\u00E6\u01FD\u01E3",
  }, {
    base: 'ao',
    chars: "\uA735",
  }, {
    base: 'au',
    chars: "\uA737",
  }, {
    base: 'av',
    chars: "\uA739\uA73B",
  }, {
    base: 'ay',
    chars: "\uA73D",
  }, {
    base: 'b',
    chars: "\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253\u0182",
  }, {
    base: 'c',
    chars: "\uFF43\u24D2\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184",
  }, {
    base: 'd',
    chars: "\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\u018B\u13E7\u0501\uA7AA",
  }, {
    base: 'dh',
    chars: "\u00F0",
  }, {
    base: 'dz',
    chars: "\u01F3\u01C6",
  }, {
    base: 'e',
    chars: "\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u01DD",
  }, {
    base: 'f',
    chars: "\u24D5\uFF46\u1E1F\u0192",
  }, {
    base: 'ff',
    chars: "\uFB00",
  }, {
    base: 'fi',
    chars: "\uFB01",
  }, {
    base: 'fl',
    chars: "\uFB02",
  }, {
    base: 'ffi',
    chars: "\uFB03",
  }, {
    base: 'ffl',
    chars: "\uFB04",
  }, {
    base: 'g',
    chars: "\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\uA77F\u1D79",
  }, {
    base: 'h',
    chars: "\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265",
  }, {
    base: 'hv',
    chars: "\u0195",
  }, {
    base: 'i',
    chars: "\u24D8\uFF49\xEC\xED\xEE\u0129\u012B\u012D\xEF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131",
  }, {
    base: 'j',
    chars: "\u24D9\uFF4A\u0135\u01F0\u0249",
  }, {
    base: 'k',
    chars: "\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3",
  }, {
    base: 'l',
    chars: "\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747\u026D",
  }, {
    base: 'lj',
    chars: "\u01C9",
  }, {
    base: 'm',
    chars: "\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F",
  }, {
    base: 'n',
    chars: "\u24DD\uFF4E\u01F9\u0144\xF1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5\u043B\u0509",
  }, {
    base: 'nj',
    chars: "\u01CC",
  }, {
    base: 'o',
    chars: "\u24DE\uFF4F\xF2\xF3\xF4\u1ED3\u1ED1\u1ED7\u1ED5\xF5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\xF6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\xF8\u01FF\uA74B\uA74D\u0275\u0254\u1D11",
  }, {
    base: 'oe',
    chars: "\u0153",
  }, {
    base: 'oi',
    chars: "\u01A3",
  }, {
    base: 'oo',
    chars: "\uA74F",
  }, {
    base: 'ou',
    chars: "\u0223",
  }, {
    base: 'p',
    chars: "\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755\u03C1",
  }, {
    base: 'q',
    chars: "\u24E0\uFF51\u024B\uA757\uA759",
  }, {
    base: 'r',
    chars: "\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783",
  }, {
    base: 's',
    chars: "\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B\u0282",
  }, {
    base: 'ss',
    chars: "\xDF",
  }, {
    base: 't',
    chars: "\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787",
  }, {
    base: 'th',
    chars: "\u00FE",
  }, {
    base: 'tz',
    chars: "\uA729",
  }, {
    base: 'u',
    chars: "\u24E4\uFF55\xF9\xFA\xFB\u0169\u1E79\u016B\u1E7B\u016D\xFC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289",
  }, {
    base: 'v',
    chars: "\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C",
  }, {
    base: 'vy',
    chars: "\uA761",
  }, {
    base: 'w',
    chars: "\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73",
  }, {
    base: 'x',
    chars: "\u24E7\uFF58\u1E8B\u1E8D",
  }, {
    base: 'y',
    chars: "\u24E8\uFF59\u1EF3\xFD\u0177\u1EF9\u0233\u1E8F\xFF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF",
  }, {
    base: 'z',
    chars: "\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763",
  }
];

var diacriticsMap = {};
for (var i = 0; i < replacementList.length; i += 1) {
  var chars = replacementList[i].chars;
  for (var j = 0; j < chars.length; j += 1) {
    diacriticsMap[chars[j]] = replacementList[i].base;
  }
}

function removeDiacritics(str) {
  return str.replace(/[^\u0000-\u007e]/g, function(c) {
    return diacriticsMap[c] || c;
  });
}

},{}],2:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.flexibility=e()}}(function(){return function e(t,r,l){function n(f,i){if(!r[f]){if(!t[f]){var s="function"==typeof require&&require;if(!i&&s)return s(f,!0);if(o)return o(f,!0);var a=new Error("Cannot find module '"+f+"'");throw a.code="MODULE_NOT_FOUND",a}var c=r[f]={exports:{}};t[f][0].call(c.exports,function(e){var r=t[f][1][e];return n(r?r:e)},c,c.exports,e,t,r,l)}return r[f].exports}for(var o="function"==typeof require&&require,f=0;f<l.length;f++)n(l[f]);return n}({1:[function(e,t,r){t.exports=function(e){var t,r,l,n=-1;if(e.lines.length>1&&"flex-start"===e.style.alignContent)for(t=0;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"flex-end"===e.style.alignContent)for(t=e.flexStyle.crossSpace;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"center"===e.style.alignContent)for(t=e.flexStyle.crossSpace/2;l=e.lines[++n];)l.crossStart=t,t+=l.cross;else if(e.lines.length>1&&"space-between"===e.style.alignContent)for(r=e.flexStyle.crossSpace/(e.lines.length-1),t=0;l=e.lines[++n];)l.crossStart=t,t+=l.cross+r;else if(e.lines.length>1&&"space-around"===e.style.alignContent)for(r=2*e.flexStyle.crossSpace/(2*e.lines.length),t=r/2;l=e.lines[++n];)l.crossStart=t,t+=l.cross+r;else for(r=e.flexStyle.crossSpace/e.lines.length,t=e.flexStyle.crossInnerBefore;l=e.lines[++n];)l.crossStart=t,l.cross+=r,t+=l.cross}},{}],2:[function(e,t,r){t.exports=function(e){for(var t,r=-1;line=e.lines[++r];)for(t=-1;child=line.children[++t];){var l=child.style.alignSelf;"auto"===l&&(l=e.style.alignItems),"flex-start"===l?child.flexStyle.crossStart=line.crossStart:"flex-end"===l?child.flexStyle.crossStart=line.crossStart+line.cross-child.flexStyle.crossOuter:"center"===l?child.flexStyle.crossStart=line.crossStart+(line.cross-child.flexStyle.crossOuter)/2:(child.flexStyle.crossStart=line.crossStart,child.flexStyle.crossOuter=line.cross,child.flexStyle.cross=child.flexStyle.crossOuter-child.flexStyle.crossBefore-child.flexStyle.crossAfter)}}},{}],3:[function(e,t,r){t.exports=function l(e,l){var t="row"===l||"row-reverse"===l,r=e.mainAxis;if(r){var n=t&&"inline"===r||!t&&"block"===r;n||(e.flexStyle={main:e.flexStyle.cross,cross:e.flexStyle.main,mainOffset:e.flexStyle.crossOffset,crossOffset:e.flexStyle.mainOffset,mainBefore:e.flexStyle.crossBefore,mainAfter:e.flexStyle.crossAfter,crossBefore:e.flexStyle.mainBefore,crossAfter:e.flexStyle.mainAfter,mainInnerBefore:e.flexStyle.crossInnerBefore,mainInnerAfter:e.flexStyle.crossInnerAfter,crossInnerBefore:e.flexStyle.mainInnerBefore,crossInnerAfter:e.flexStyle.mainInnerAfter,mainBorderBefore:e.flexStyle.crossBorderBefore,mainBorderAfter:e.flexStyle.crossBorderAfter,crossBorderBefore:e.flexStyle.mainBorderBefore,crossBorderAfter:e.flexStyle.mainBorderAfter})}else t?e.flexStyle={main:e.style.width,cross:e.style.height,mainOffset:e.style.offsetWidth,crossOffset:e.style.offsetHeight,mainBefore:e.style.marginLeft,mainAfter:e.style.marginRight,crossBefore:e.style.marginTop,crossAfter:e.style.marginBottom,mainInnerBefore:e.style.paddingLeft,mainInnerAfter:e.style.paddingRight,crossInnerBefore:e.style.paddingTop,crossInnerAfter:e.style.paddingBottom,mainBorderBefore:e.style.borderLeftWidth,mainBorderAfter:e.style.borderRightWidth,crossBorderBefore:e.style.borderTopWidth,crossBorderAfter:e.style.borderBottomWidth}:e.flexStyle={main:e.style.height,cross:e.style.width,mainOffset:e.style.offsetHeight,crossOffset:e.style.offsetWidth,mainBefore:e.style.marginTop,mainAfter:e.style.marginBottom,crossBefore:e.style.marginLeft,crossAfter:e.style.marginRight,mainInnerBefore:e.style.paddingTop,mainInnerAfter:e.style.paddingBottom,crossInnerBefore:e.style.paddingLeft,crossInnerAfter:e.style.paddingRight,mainBorderBefore:e.style.borderTopWidth,mainBorderAfter:e.style.borderBottomWidth,crossBorderBefore:e.style.borderLeftWidth,crossBorderAfter:e.style.borderRightWidth},"content-box"===e.style.boxSizing&&("number"==typeof e.flexStyle.main&&(e.flexStyle.main+=e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter),"number"==typeof e.flexStyle.cross&&(e.flexStyle.cross+=e.flexStyle.crossInnerBefore+e.flexStyle.crossInnerAfter+e.flexStyle.crossBorderBefore+e.flexStyle.crossBorderAfter));e.mainAxis=t?"inline":"block",e.crossAxis=t?"block":"inline","number"==typeof e.style.flexBasis&&(e.flexStyle.main=e.style.flexBasis+e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter),e.flexStyle.mainOuter=e.flexStyle.main,e.flexStyle.crossOuter=e.flexStyle.cross,"auto"===e.flexStyle.mainOuter&&(e.flexStyle.mainOuter=e.flexStyle.mainOffset),"auto"===e.flexStyle.crossOuter&&(e.flexStyle.crossOuter=e.flexStyle.crossOffset),"number"==typeof e.flexStyle.mainBefore&&(e.flexStyle.mainOuter+=e.flexStyle.mainBefore),"number"==typeof e.flexStyle.mainAfter&&(e.flexStyle.mainOuter+=e.flexStyle.mainAfter),"number"==typeof e.flexStyle.crossBefore&&(e.flexStyle.crossOuter+=e.flexStyle.crossBefore),"number"==typeof e.flexStyle.crossAfter&&(e.flexStyle.crossOuter+=e.flexStyle.crossAfter)}},{}],4:[function(e,t,r){var l=e("../reduce");t.exports=function(e){if(e.mainSpace>0){var t=l(e.children,function(e,t){return e+parseFloat(t.style.flexGrow)},0);t>0&&(e.main=l(e.children,function(r,l){return"auto"===l.flexStyle.main?l.flexStyle.main=l.flexStyle.mainOffset+parseFloat(l.style.flexGrow)/t*e.mainSpace:l.flexStyle.main+=parseFloat(l.style.flexGrow)/t*e.mainSpace,l.flexStyle.mainOuter=l.flexStyle.main+l.flexStyle.mainBefore+l.flexStyle.mainAfter,r+l.flexStyle.mainOuter},0),e.mainSpace=0)}}},{"../reduce":12}],5:[function(e,t,r){var l=e("../reduce");t.exports=function(e){if(e.mainSpace<0){var t=l(e.children,function(e,t){return e+parseFloat(t.style.flexShrink)},0);t>0&&(e.main=l(e.children,function(r,l){return l.flexStyle.main+=parseFloat(l.style.flexShrink)/t*e.mainSpace,l.flexStyle.mainOuter=l.flexStyle.main+l.flexStyle.mainBefore+l.flexStyle.mainAfter,r+l.flexStyle.mainOuter},0),e.mainSpace=0)}}},{"../reduce":12}],6:[function(e,t,r){var l=e("../reduce");t.exports=function(e){var t;e.lines=[t={main:0,cross:0,children:[]}];for(var r,n=-1;r=e.children[++n];)"nowrap"===e.style.flexWrap||0===t.children.length||"auto"===e.flexStyle.main||e.flexStyle.main-e.flexStyle.mainInnerBefore-e.flexStyle.mainInnerAfter-e.flexStyle.mainBorderBefore-e.flexStyle.mainBorderAfter>=t.main+r.flexStyle.mainOuter?(t.main+=r.flexStyle.mainOuter,t.cross=Math.max(t.cross,r.flexStyle.crossOuter)):e.lines.push(t={main:r.flexStyle.mainOuter,cross:r.flexStyle.crossOuter,children:[]}),t.children.push(r);e.flexStyle.mainLines=l(e.lines,function(e,t){return Math.max(e,t.main)},0),e.flexStyle.crossLines=l(e.lines,function(e,t){return e+t.cross},0),"auto"===e.flexStyle.main&&(e.flexStyle.main=Math.max(e.flexStyle.mainOffset,e.flexStyle.mainLines+e.flexStyle.mainInnerBefore+e.flexStyle.mainInnerAfter+e.flexStyle.mainBorderBefore+e.flexStyle.mainBorderAfter)),"auto"===e.flexStyle.cross&&(e.flexStyle.cross=Math.max(e.flexStyle.crossOffset,e.flexStyle.crossLines+e.flexStyle.crossInnerBefore+e.flexStyle.crossInnerAfter+e.flexStyle.crossBorderBefore+e.flexStyle.crossBorderAfter)),e.flexStyle.crossSpace=e.flexStyle.cross-e.flexStyle.crossInnerBefore-e.flexStyle.crossInnerAfter-e.flexStyle.crossBorderBefore-e.flexStyle.crossBorderAfter-e.flexStyle.crossLines,e.flexStyle.mainOuter=e.flexStyle.main+e.flexStyle.mainBefore+e.flexStyle.mainAfter,e.flexStyle.crossOuter=e.flexStyle.cross+e.flexStyle.crossBefore+e.flexStyle.crossAfter}},{"../reduce":12}],7:[function(e,t,r){function l(t){for(var r,l=-1;r=t.children[++l];)e("./flex-direction")(r,t.style.flexDirection);e("./flex-direction")(t,t.style.flexDirection),e("./order")(t),e("./flexbox-lines")(t),e("./align-content")(t),l=-1;for(var n;n=t.lines[++l];)n.mainSpace=t.flexStyle.main-t.flexStyle.mainInnerBefore-t.flexStyle.mainInnerAfter-t.flexStyle.mainBorderBefore-t.flexStyle.mainBorderAfter-n.main,e("./flex-grow")(n),e("./flex-shrink")(n),e("./margin-main")(n),e("./margin-cross")(n),e("./justify-content")(n,t.style.justifyContent,t);e("./align-items")(t)}t.exports=l},{"./align-content":1,"./align-items":2,"./flex-direction":3,"./flex-grow":4,"./flex-shrink":5,"./flexbox-lines":6,"./justify-content":8,"./margin-cross":9,"./margin-main":10,"./order":11}],8:[function(e,t,r){t.exports=function(e,t,r){var l,n,o,f=r.flexStyle.mainInnerBefore,i=-1;if("flex-end"===t)for(l=e.mainSpace,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter;else if("center"===t)for(l=e.mainSpace/2,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter;else if("space-between"===t)for(n=e.mainSpace/(e.children.length-1),l=0,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter+n;else if("space-around"===t)for(n=2*e.mainSpace/(2*e.children.length),l=n/2,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter+n;else for(l=0,l+=f;o=e.children[++i];)o.flexStyle.mainStart=l,l+=o.flexStyle.mainOuter}},{}],9:[function(e,t,r){t.exports=function(e){for(var t,r=-1;t=e.children[++r];){var l=0;"auto"===t.flexStyle.crossBefore&&++l,"auto"===t.flexStyle.crossAfter&&++l;var n=e.cross-t.flexStyle.crossOuter;"auto"===t.flexStyle.crossBefore&&(t.flexStyle.crossBefore=n/l),"auto"===t.flexStyle.crossAfter&&(t.flexStyle.crossAfter=n/l),"auto"===t.flexStyle.cross?t.flexStyle.crossOuter=t.flexStyle.crossOffset+t.flexStyle.crossBefore+t.flexStyle.crossAfter:t.flexStyle.crossOuter=t.flexStyle.cross+t.flexStyle.crossBefore+t.flexStyle.crossAfter}}},{}],10:[function(e,t,r){t.exports=function(e){for(var t,r=0,l=-1;t=e.children[++l];)"auto"===t.flexStyle.mainBefore&&++r,"auto"===t.flexStyle.mainAfter&&++r;if(r>0){for(l=-1;t=e.children[++l];)"auto"===t.flexStyle.mainBefore&&(t.flexStyle.mainBefore=e.mainSpace/r),"auto"===t.flexStyle.mainAfter&&(t.flexStyle.mainAfter=e.mainSpace/r),"auto"===t.flexStyle.main?t.flexStyle.mainOuter=t.flexStyle.mainOffset+t.flexStyle.mainBefore+t.flexStyle.mainAfter:t.flexStyle.mainOuter=t.flexStyle.main+t.flexStyle.mainBefore+t.flexStyle.mainAfter;e.mainSpace=0}}},{}],11:[function(e,t,r){var l=/^(column|row)-reverse$/;t.exports=function(e){e.children.sort(function(e,t){return e.style.order-t.style.order||e.index-t.index}),l.test(e.style.flexDirection)&&e.children.reverse()}},{}],12:[function(e,t,r){function l(e,t,r){for(var l=e.length,n=-1;++n<l;)n in e&&(r=t(r,e[n],n));return r}t.exports=l},{}],13:[function(e,t,r){function l(e){i(f(e))}var n=e("./read"),o=e("./write"),f=e("./readAll"),i=e("./writeAll");t.exports=l,t.exports.read=n,t.exports.write=o,t.exports.readAll=f,t.exports.writeAll=i},{"./read":15,"./readAll":16,"./write":17,"./writeAll":18}],14:[function(e,t,r){function l(e,t,r){var l=e[t],f=String(l).match(o);if(!f){var a=t.match(s);if(a){var c=e["border"+a[1]+"Style"];return"none"===c?0:i[l]||0}return l}var y=f[1],x=f[2];return"px"===x?1*y:"cm"===x?.3937*y*96:"in"===x?96*y:"mm"===x?.3937*y*96/10:"pc"===x?12*y*96/72:"pt"===x?96*y/72:"rem"===x?16*y:n(l,r)}function n(e,t){f.style.cssText="border:none!important;clip:rect(0 0 0 0)!important;display:block!important;font-size:1em!important;height:0!important;margin:0!important;padding:0!important;position:relative!important;width:"+e+"!important",t.parentNode.insertBefore(f,t.nextSibling);var r=f.offsetWidth;return t.parentNode.removeChild(f),r}t.exports=l;var o=/^([-+]?\d*\.?\d+)(%|[a-z]+)$/,f=document.createElement("div"),i={medium:4,none:0,thick:6,thin:2},s=/^border(Bottom|Left|Right|Top)Width$/},{}],15:[function(e,t,r){function l(e){var t={alignContent:"stretch",alignItems:"stretch",alignSelf:"auto",borderBottomStyle:"none",borderBottomWidth:0,borderLeftStyle:"none",borderLeftWidth:0,borderRightStyle:"none",borderRightWidth:0,borderTopStyle:"none",borderTopWidth:0,boxSizing:"content-box",display:"inline",flexBasis:"auto",flexDirection:"row",flexGrow:0,flexShrink:1,flexWrap:"nowrap",justifyContent:"flex-start",height:"auto",marginTop:0,marginRight:0,marginLeft:0,marginBottom:0,paddingTop:0,paddingRight:0,paddingLeft:0,paddingBottom:0,maxHeight:"none",maxWidth:"none",minHeight:0,minWidth:0,order:0,position:"static",width:"auto"},r=e instanceof Element;if(r){var l=e.hasAttribute("data-style"),i=l?e.getAttribute("data-style"):e.getAttribute("style")||"";l||e.setAttribute("data-style",i);var s=window.getComputedStyle&&getComputedStyle(e)||{};f(t,s);var c=e.currentStyle||{};n(t,c),o(t,i);for(var y in t)t[y]=a(t,y,e);var x=e.getBoundingClientRect();t.offsetHeight=x.height||e.offsetHeight,t.offsetWidth=x.width||e.offsetWidth}var S={element:e,style:t};return S}function n(e,t){for(var r in e){var l=r in t;if(l)e[r]=t[r];else{var n=r.replace(/[A-Z]/g,"-$&").toLowerCase(),o=n in t;o&&(e[r]=t[n])}}var f="-js-display"in t;f&&(e.display=t["-js-display"])}function o(e,t){for(var r;r=i.exec(t);){var l=r[1].toLowerCase().replace(/-[a-z]/g,function(e){return e.slice(1).toUpperCase()});e[l]=r[2]}}function f(e,t){for(var r in e){var l=r in t;l&&!s.test(r)&&(e[r]=t[r])}}t.exports=l;var i=/([^\s:;]+)\s*:\s*([^;]+?)\s*(;|$)/g,s=/^(alignSelf|height|width)$/,a=e("./getComputedLength")},{"./getComputedLength":14}],16:[function(e,t,r){function l(e){var t=[];return n(e,t),t}function n(e,t){for(var r,l=o(e),i=[],s=-1;r=e.childNodes[++s];){var a=3===r.nodeType&&!/^\s*$/.test(r.nodeValue);if(l&&a){var c=r;r=e.insertBefore(document.createElement("flex-item"),c),r.appendChild(c)}var y=r instanceof Element;if(y){var x=n(r,t);if(l){var S=r.style;S.display="inline-block",S.position="absolute",x.style=f(r).style,i.push(x)}}}var m={element:e,children:i};return l&&(m.style=f(e).style,t.push(m)),m}function o(e){var t=e instanceof Element,r=t&&e.getAttribute("data-style"),l=t&&e.currentStyle&&e.currentStyle["-js-display"],n=i.test(r)||s.test(l);return n}t.exports=l;var f=e("../read"),i=/(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i,s=/^(inline-)?flex$/i},{"../read":15}],17:[function(e,t,r){function l(e){o(e);var t=e.element.style,r="inline"===e.mainAxis?["main","cross"]:["cross","main"];t.boxSizing="content-box",t.display="block",t.position="relative",t.width=n(e.flexStyle[r[0]]-e.flexStyle[r[0]+"InnerBefore"]-e.flexStyle[r[0]+"InnerAfter"]-e.flexStyle[r[0]+"BorderBefore"]-e.flexStyle[r[0]+"BorderAfter"]),t.height=n(e.flexStyle[r[1]]-e.flexStyle[r[1]+"InnerBefore"]-e.flexStyle[r[1]+"InnerAfter"]-e.flexStyle[r[1]+"BorderBefore"]-e.flexStyle[r[1]+"BorderAfter"]);for(var l,f=-1;l=e.children[++f];){var i=l.element.style,s="inline"===l.mainAxis?["main","cross"]:["cross","main"];i.boxSizing="content-box",i.display="block",i.position="absolute","auto"!==l.flexStyle[s[0]]&&(i.width=n(l.flexStyle[s[0]]-l.flexStyle[s[0]+"InnerBefore"]-l.flexStyle[s[0]+"InnerAfter"]-l.flexStyle[s[0]+"BorderBefore"]-l.flexStyle[s[0]+"BorderAfter"])),"auto"!==l.flexStyle[s[1]]&&(i.height=n(l.flexStyle[s[1]]-l.flexStyle[s[1]+"InnerBefore"]-l.flexStyle[s[1]+"InnerAfter"]-l.flexStyle[s[1]+"BorderBefore"]-l.flexStyle[s[1]+"BorderAfter"])),i.top=n(l.flexStyle[s[1]+"Start"]),i.left=n(l.flexStyle[s[0]+"Start"]),i.marginTop=n(l.flexStyle[s[1]+"Before"]),i.marginRight=n(l.flexStyle[s[0]+"After"]),i.marginBottom=n(l.flexStyle[s[1]+"After"]),i.marginLeft=n(l.flexStyle[s[0]+"Before"])}}function n(e){return"string"==typeof e?e:Math.max(e,0)+"px"}t.exports=l;var o=e("../flexbox")},{"../flexbox":7}],18:[function(e,t,r){function l(e){for(var t,r=-1;t=e[++r];)n(t)}t.exports=l;var n=e("../write")},{"../write":17}]},{},[13])(13)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(string) {
    return fuzzy.test(pattern, string);
  });
};

// Does `pattern` fuzzy match `string`?
fuzzy.test = function(pattern, string) {
  return fuzzy.match(pattern, string) !== null;
};

// If `pattern` matches `string`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, string, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = string.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && string || string.toLowerCase()
    , ch, compareChar;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = string[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],4:[function(require,module,exports){
'use strict';
module.exports = leftPad;

var cache = [
  '',
  ' ',
  '  ',
  '   ',
  '    ',
  '     ',
  '      ',
  '       ',
  '        ',
  '         '
];

function leftPad (str, len, ch) {
  // convert `str` to `string`
  str = str + '';
  // `len` is the `pad`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // `ch` defaults to `' '`
  if (!ch && ch !== 0) ch = ' ';
  // convert `ch` to `string`
  ch = ch + '';
  // cache common use cases
  if (ch === ' ' && len < 10) return cache[len] + str;
  // `pad` starts with an empty string
  var pad = '';
  // loop
  while (true) {
    // add `ch` to `pad` if `len` is odd
    if (len & 1) pad += ch;
    // devide `len` by 2, ditch the fraction
    len >>= 1;
    // "double" the `ch` so this operation count grows logarithmically on `len`
    // each time `ch` is "doubled", the `len` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    if (len) ch += ch;
    // `len` is 0, exit the loop
    else break;
  }
  // pad `str`!
  return pad + str;
}

},{}],5:[function(require,module,exports){
'use strict';

var leftPad = require('left-pad');
var getWeek = require('./getWeek');

function getURLOfUsers(weekOffset, type, id) {
  return '//' + window.location.host + '/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F' + (getWeek() + weekOffset + '%2F' + type + '%2F' + type + leftPad(id, 5, '0') + '.htm');
}

module.exports = getURLOfUsers;

},{"./getWeek":6,"left-pad":4}],6:[function(require,module,exports){
"use strict";

// copied from http://www.meetingpointmco.nl/Roosters-AL/doc/dagroosters/untisscripts.js,
// were using the same code as they do to be sure that we always get the same
// week number.
function getWeek() {
  // Create a copy of this date object
  var target = new Date();

  // ISO week date weeks start on monday
  // so correct the day number
  var dayNr = (target.getDay() + 6) % 7;

  // ISO 8601 states that week 1 is the week
  // with the first thursday of that year.
  // Set the target date to the thursday in the target week
  target.setDate(target.getDate() - dayNr + 3);

  // Store the millisecond value of the target date
  var firstThursday = target.valueOf();

  // Set the target to the first thursday of the year
  // First set the target to january first
  target.setMonth(0, 1);
  // Not a thursday? Correct the date to the next thursday
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
  }

  // The weeknumber is the number of weeks between the
  // first thursday of the year and the thursday in the target week
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

module.exports = getWeek;

},{}],7:[function(require,module,exports){
'use strict';

/* global ga */

require('flexibility');

var fuzzy = require('fuzzy');
// const getUsers = require('./getUsers')
var getURLOfUser = require('./getURLOfUser');
var removeDiacritics = require('diacritics').remove;
var getWeek = require('./getWeek');

var searchNode = document.querySelector('#search');
var inputNode = searchNode.querySelector('input[type="text"]');
var autocompleteNode = document.querySelector('.autocomplete');
var scheduleIframe = document.querySelector('#schedule');
var prevButton = document.querySelectorAll('input[type="button"]')[0];
var nextButton = document.querySelectorAll('input[type="button"]')[1];
var currentWeekNode = document.querySelector('.current');
var favNode = document.querySelector('.fav');

if (window.location.href.split('?')[1] !== 'nfd') {
  // nfd = no feature detection
  if (document.querySelector('#schedule').getClientRects()[0].bottom !== document.body.offsetHeight) {
    window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/';
  } else {
    window.onerror = function () {
      window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/';
    };
  }
}

var selectedResult = -1;
var selectedUser = void 0;
var results = [];
var offset = 0;

function getUsers() {
  var nodes = document.querySelector('#data').querySelectorAll('.data-user');
  var elements = Array.prototype.slice.call(nodes);
  var users = elements.map(function (userNode) {
    var type = userNode.querySelector('.data-type').textContent;
    var value = userNode.querySelector('.data-value').textContent;
    var index = Number(userNode.querySelector('.data-index').textContent);
    return { type: type, value: value, index: index };
  });

  document.querySelector('#data').outerHTML = '';

  return users;
}

var users = getUsers();

function getCurrentFav() {
  if (!window.localStorage.getItem('fav')) return;
  var favCode = window.localStorage.getItem('fav').split(':');
  var fav = users.filter(function (user) {
    return user.type === favCode[0] && user.index === Number(favCode[1]);
  });
  return fav[0];
}

function changeFav(isFav) {
  if (!selectedUser) return;
  if (isFav) {
    window.localStorage.setItem('fav', selectedUser.type + ':' + selectedUser.index);
  } else {
    window.localStorage.removeItem('fav');
  }
  updateFavNode();
}

function usersEqual(user1, user2) {
  if (user1 == null || user2 == null) return false;
  return user1.type === user2.type && user1.index === user2.index;
}

function updateFavNode() {
  if (usersEqual(getCurrentFav(), selectedUser)) {
    favNode.innerHTML = '&#xE838;';
  } else {
    favNode.innerHTML = '&#xE83A';
  }
}

function updateWeekText() {
  if (offset === 0) currentWeekNode.innerHTML = 'Week ' + (getWeek() + offset);else currentWeekNode.innerHTML = '<strong>Week ' + (getWeek() + offset) + '</strong>';
}

updateWeekText();

searchNode.addEventListener('keydown', function (e) {
  if (results.length !== 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();

    if (document.querySelector('.selected')) document.querySelector('.selected').classList.remove('selected');

    var change = e.key === 'ArrowDown' ? 1 : -1;
    selectedResult += change;
    if (selectedResult < -1) selectedResult = results.length - 1;else if (selectedResult > results.length - 1) selectedResult = -1;

    if (selectedResult !== -1) autocompleteNode.children[selectedResult].classList.add('selected');
  }
});

searchNode.addEventListener('input', function (e) {
  autocompleteNode.innerHTML = '';
  if (inputNode.value.trim() === '') return;

  selectedResult = -1;
  results = fuzzy.filter(removeDiacritics(inputNode.value), users, {
    extract: function extract(el) {
      return removeDiacritics(el.value);
    }
  }).slice(0, 7);

  results.forEach(function (result) {
    var resultNode = document.createElement('li');
    resultNode.innerHTML = '' + result.original.value;
    autocompleteNode.appendChild(resultNode);
  });
});

searchNode.addEventListener('submit', submitForm);

function submitForm(e) {
  if (e) e.preventDefault();
  if (results.length !== 0) {
    var indexInResult = selectedResult === -1 ? 0 : selectedResult;
    selectedUser = users[results[indexInResult].index];
  }
  if (selectedUser == null) return;

  updateFavNode();

  inputNode.value = selectedUser.value;
  autocompleteNode.innerHTML = '';

  inputNode.blur();

  scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);

  var eventAction = void 0;
  switch (selectedUser.type) {
    case 'c':
      eventAction = 'Class';
      break;
    case 't':
      eventAction = 'Teacher';
      break;
    case 'r':
      eventAction = 'Room';
      break;
    case 's':
      eventAction = 'Student';
      break;
  }
  var eventLabel = selectedUser.value;

  ga(function () {
    ga('send', { hitType: 'event', eventCategory: 'search', eventAction: eventAction, eventLabel: eventLabel });
  });
}

autocompleteNode.addEventListener('click', function (e) {
  if (autocompleteNode.contains(e.target)) {
    selectedResult = Array.prototype.indexOf.call(e.target.parentElement.childNodes, e.target);
    submitForm();
  }
});

prevButton.addEventListener('click', function () {
  offset--;
  updateWeekText();
  submitForm();
});

nextButton.addEventListener('click', function () {
  offset++;
  updateWeekText();
  submitForm();
});

inputNode.addEventListener('click', function () {
  inputNode.select();
});

inputNode.addEventListener('blur', function () {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (!isSafari) {
    inputNode.selectionStart = inputNode.selectionEnd = -1;
  }
});

searchNode.addEventListener('blur', function (e) {
  autocompleteNode.innerHTML = '';
});

favNode.addEventListener('click', function () {
  if (usersEqual(getCurrentFav(), selectedUser)) {
    changeFav(false);
  } else {
    changeFav(true);
  }
});

var currentFav = getCurrentFav();

if (currentFav) {
  selectedUser = currentFav;
  inputNode.value = selectedUser.value;
  scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);
  updateFavNode();
}

},{"./getURLOfUser":5,"./getWeek":6,"diacritics":1,"flexibility":2,"fuzzy":3}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGlhY3JpdGljcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGV4aWJpbGl0eS9mbGV4aWJpbGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZ2V0VVJMT2ZVc2VyLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2dldFdlZWsuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pUQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QWEsSUFBbEMsRUFBd0MsYUFBYSxLQUFiLEdBQXFCLENBQTdELENBQXJCO0FBQ0E7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLnJlbW92ZSA9IHJlbW92ZURpYWNyaXRpY3M7XG5cbnZhciByZXBsYWNlbWVudExpc3QgPSBbXG4gIHtcbiAgICBiYXNlOiAnICcsXG4gICAgY2hhcnM6IFwiXFx1MDBBMFwiLFxuICB9LCB7XG4gICAgYmFzZTogJzAnLFxuICAgIGNoYXJzOiBcIlxcdTA3QzBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBJyxcbiAgICBjaGFyczogXCJcXHUyNEI2XFx1RkYyMVxcdTAwQzBcXHUwMEMxXFx1MDBDMlxcdTFFQTZcXHUxRUE0XFx1MUVBQVxcdTFFQThcXHUwMEMzXFx1MDEwMFxcdTAxMDJcXHUxRUIwXFx1MUVBRVxcdTFFQjRcXHUxRUIyXFx1MDIyNlxcdTAxRTBcXHUwMEM0XFx1MDFERVxcdTFFQTJcXHUwMEM1XFx1MDFGQVxcdTAxQ0RcXHUwMjAwXFx1MDIwMlxcdTFFQTBcXHUxRUFDXFx1MUVCNlxcdTFFMDBcXHUwMTA0XFx1MDIzQVxcdTJDNkZcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBQScsXG4gICAgY2hhcnM6IFwiXFx1QTczMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FFJyxcbiAgICBjaGFyczogXCJcXHUwMEM2XFx1MDFGQ1xcdTAxRTJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBTycsXG4gICAgY2hhcnM6IFwiXFx1QTczNFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FVJyxcbiAgICBjaGFyczogXCJcXHVBNzM2XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQVYnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzhcXHVBNzNBXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQVknLFxuICAgIGNoYXJzOiBcIlxcdUE3M0NcIixcbiAgfSwge1xuICAgIGJhc2U6ICdCJyxcbiAgICBjaGFyczogXCJcXHUyNEI3XFx1RkYyMlxcdTFFMDJcXHUxRTA0XFx1MUUwNlxcdTAyNDNcXHUwMTgxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQycsXG4gICAgY2hhcnM6IFwiXFx1MjRiOFxcdWZmMjNcXHVBNzNFXFx1MUUwOFxcdTAxMDZcXHUwMDQzXFx1MDEwOFxcdTAxMEFcXHUwMTBDXFx1MDBDN1xcdTAxODdcXHUwMjNCXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRCcsXG4gICAgY2hhcnM6IFwiXFx1MjRCOVxcdUZGMjRcXHUxRTBBXFx1MDEwRVxcdTFFMENcXHUxRTEwXFx1MUUxMlxcdTFFMEVcXHUwMTEwXFx1MDE4QVxcdTAxODlcXHUxRDA1XFx1QTc3OVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0RoJyxcbiAgICBjaGFyczogXCJcXHUwMEQwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRFonLFxuICAgIGNoYXJzOiBcIlxcdTAxRjFcXHUwMUM0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRHonLFxuICAgIGNoYXJzOiBcIlxcdTAxRjJcXHUwMUM1XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRScsXG4gICAgY2hhcnM6IFwiXFx1MDI1QlxcdTI0QkFcXHVGRjI1XFx1MDBDOFxcdTAwQzlcXHUwMENBXFx1MUVDMFxcdTFFQkVcXHUxRUM0XFx1MUVDMlxcdTFFQkNcXHUwMTEyXFx1MUUxNFxcdTFFMTZcXHUwMTE0XFx1MDExNlxcdTAwQ0JcXHUxRUJBXFx1MDExQVxcdTAyMDRcXHUwMjA2XFx1MUVCOFxcdTFFQzZcXHUwMjI4XFx1MUUxQ1xcdTAxMThcXHUxRTE4XFx1MUUxQVxcdTAxOTBcXHUwMThFXFx1MUQwN1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ0YnLFxuICAgIGNoYXJzOiBcIlxcdUE3N0NcXHUyNEJCXFx1RkYyNlxcdTFFMUVcXHUwMTkxXFx1QTc3QlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0cnLFxuICAgIGNoYXJzOiBcIlxcdTI0QkNcXHVGRjI3XFx1MDFGNFxcdTAxMUNcXHUxRTIwXFx1MDExRVxcdTAxMjBcXHUwMUU2XFx1MDEyMlxcdTAxRTRcXHUwMTkzXFx1QTdBMFxcdUE3N0RcXHVBNzdFXFx1MDI2MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0gnLFxuICAgIGNoYXJzOiBcIlxcdTI0QkRcXHVGRjI4XFx1MDEyNFxcdTFFMjJcXHUxRTI2XFx1MDIxRVxcdTFFMjRcXHUxRTI4XFx1MUUyQVxcdTAxMjZcXHUyQzY3XFx1MkM3NVxcdUE3OERcIixcbiAgfSwge1xuICAgIGJhc2U6ICdJJyxcbiAgICBjaGFyczogXCJcXHUyNEJFXFx1RkYyOVxceENDXFx4Q0RcXHhDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHhDRlxcdTFFMkVcXHUxRUM4XFx1MDFDRlxcdTAyMDhcXHUwMjBBXFx1MUVDQVxcdTAxMkVcXHUxRTJDXFx1MDE5N1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ0onLFxuICAgIGNoYXJzOiBcIlxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhcXHUwMjM3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnSycsXG4gICAgY2hhcnM6IFwiXFx1MjRDMFxcdUZGMkJcXHUxRTMwXFx1MDFFOFxcdTFFMzJcXHUwMTM2XFx1MUUzNFxcdTAxOThcXHUyQzY5XFx1QTc0MFxcdUE3NDJcXHVBNzQ0XFx1QTdBMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0wnLFxuICAgIGNoYXJzOiBcIlxcdTI0QzFcXHVGRjJDXFx1MDEzRlxcdTAxMzlcXHUwMTNEXFx1MUUzNlxcdTFFMzhcXHUwMTNCXFx1MUUzQ1xcdTFFM0FcXHUwMTQxXFx1MDIzRFxcdTJDNjJcXHUyQzYwXFx1QTc0OFxcdUE3NDZcXHVBNzgwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTEonLFxuICAgIGNoYXJzOiBcIlxcdTAxQzdcIixcbiAgfSwge1xuICAgIGJhc2U6ICdMaicsXG4gICAgY2hhcnM6IFwiXFx1MDFDOFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ00nLFxuICAgIGNoYXJzOiBcIlxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNcXHUwM0ZCXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTicsXG4gICAgY2hhcnM6IFwiXFx1QTdBNFxcdTAyMjBcXHUyNEMzXFx1RkYyRVxcdTAxRjhcXHUwMTQzXFx4RDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMTlEXFx1QTc5MFxcdTFEMEVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdOSicsXG4gICAgY2hhcnM6IFwiXFx1MDFDQVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ05qJyxcbiAgICBjaGFyczogXCJcXHUwMUNCXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTycsXG4gICAgY2hhcnM6IFwiXFx1MjRDNFxcdUZGMkZcXHhEMlxceEQzXFx4RDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx4RDVcXHUxRTRDXFx1MDIyQ1xcdTFFNEVcXHUwMTRDXFx1MUU1MFxcdTFFNTJcXHUwMTRFXFx1MDIyRVxcdTAyMzBcXHhENlxcdTAyMkFcXHUxRUNFXFx1MDE1MFxcdTAxRDFcXHUwMjBDXFx1MDIwRVxcdTAxQTBcXHUxRURDXFx1MUVEQVxcdTFFRTBcXHUxRURFXFx1MUVFMlxcdTFFQ0NcXHUxRUQ4XFx1MDFFQVxcdTAxRUNcXHhEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnT0UnLFxuICAgIGNoYXJzOiBcIlxcdTAxNTJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdPSScsXG4gICAgY2hhcnM6IFwiXFx1MDFBMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ09PJyxcbiAgICBjaGFyczogXCJcXHVBNzRFXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnT1UnLFxuICAgIGNoYXJzOiBcIlxcdTAyMjJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdQJyxcbiAgICBjaGFyczogXCJcXHUyNEM1XFx1RkYzMFxcdTFFNTRcXHUxRTU2XFx1MDFBNFxcdTJDNjNcXHVBNzUwXFx1QTc1MlxcdUE3NTRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdRJyxcbiAgICBjaGFyczogXCJcXHUyNEM2XFx1RkYzMVxcdUE3NTZcXHVBNzU4XFx1MDI0QVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1InLFxuICAgIGNoYXJzOiBcIlxcdTI0QzdcXHVGRjMyXFx1MDE1NFxcdTFFNThcXHUwMTU4XFx1MDIxMFxcdTAyMTJcXHUxRTVBXFx1MUU1Q1xcdTAxNTZcXHUxRTVFXFx1MDI0Q1xcdTJDNjRcXHVBNzVBXFx1QTdBNlxcdUE3ODJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdTJyxcbiAgICBjaGFyczogXCJcXHUyNEM4XFx1RkYzM1xcdTFFOUVcXHUwMTVBXFx1MUU2NFxcdTAxNUNcXHUxRTYwXFx1MDE2MFxcdTFFNjZcXHUxRTYyXFx1MUU2OFxcdTAyMThcXHUwMTVFXFx1MkM3RVxcdUE3QThcXHVBNzg0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVCcsXG4gICAgY2hhcnM6IFwiXFx1MjRDOVxcdUZGMzRcXHUxRTZBXFx1MDE2NFxcdTFFNkNcXHUwMjFBXFx1MDE2MlxcdTFFNzBcXHUxRTZFXFx1MDE2NlxcdTAxQUNcXHUwMUFFXFx1MDIzRVxcdUE3ODZcIixcbiAgfSwge1xuICAgIGJhc2U6ICdUaCcsXG4gICAgY2hhcnM6IFwiXFx1MDBERVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1RaJyxcbiAgICBjaGFyczogXCJcXHVBNzI4XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVScsXG4gICAgY2hhcnM6IFwiXFx1MjRDQVxcdUZGMzVcXHhEOVxceERBXFx4REJcXHUwMTY4XFx1MUU3OFxcdTAxNkFcXHUxRTdBXFx1MDE2Q1xceERDXFx1MDFEQlxcdTAxRDdcXHUwMUQ1XFx1MDFEOVxcdTFFRTZcXHUwMTZFXFx1MDE3MFxcdTAxRDNcXHUwMjE0XFx1MDIxNlxcdTAxQUZcXHUxRUVBXFx1MUVFOFxcdTFFRUVcXHUxRUVDXFx1MUVGMFxcdTFFRTRcXHUxRTcyXFx1MDE3MlxcdTFFNzZcXHUxRTc0XFx1MDI0NFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1YnLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0JcXHVGRjM2XFx1MUU3Q1xcdTFFN0VcXHUwMUIyXFx1QTc1RVxcdTAyNDVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdWWScsXG4gICAgY2hhcnM6IFwiXFx1QTc2MFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1cnLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0NcXHVGRjM3XFx1MUU4MFxcdTFFODJcXHUwMTc0XFx1MUU4NlxcdTFFODRcXHUxRTg4XFx1MkM3MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1gnLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0RcXHVGRjM4XFx1MUU4QVxcdTFFOENcIixcbiAgfSwge1xuICAgIGJhc2U6ICdZJyxcbiAgICBjaGFyczogXCJcXHUyNENFXFx1RkYzOVxcdTFFRjJcXHhERFxcdTAxNzZcXHUxRUY4XFx1MDIzMlxcdTFFOEVcXHUwMTc4XFx1MUVGNlxcdTFFRjRcXHUwMUIzXFx1MDI0RVxcdTFFRkVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdaJyxcbiAgICBjaGFyczogXCJcXHUyNENGXFx1RkYzQVxcdTAxNzlcXHUxRTkwXFx1MDE3QlxcdTAxN0RcXHUxRTkyXFx1MUU5NFxcdTAxQjVcXHUwMjI0XFx1MkM3RlxcdTJDNkJcXHVBNzYyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYScsXG4gICAgY2hhcnM6IFwiXFx1MjREMFxcdUZGNDFcXHUxRTlBXFx1MDBFMFxcdTAwRTFcXHUwMEUyXFx1MUVBN1xcdTFFQTVcXHUxRUFCXFx1MUVBOVxcdTAwRTNcXHUwMTAxXFx1MDEwM1xcdTFFQjFcXHUxRUFGXFx1MUVCNVxcdTFFQjNcXHUwMjI3XFx1MDFFMVxcdTAwRTRcXHUwMURGXFx1MUVBM1xcdTAwRTVcXHUwMUZCXFx1MDFDRVxcdTAyMDFcXHUwMjAzXFx1MUVBMVxcdTFFQURcXHUxRUI3XFx1MUUwMVxcdTAxMDVcXHUyQzY1XFx1MDI1MFxcdTAyNTFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhYScsXG4gICAgY2hhcnM6IFwiXFx1QTczM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ2FlJyxcbiAgICBjaGFyczogXCJcXHUwMEU2XFx1MDFGRFxcdTAxRTNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhbycsXG4gICAgY2hhcnM6IFwiXFx1QTczNVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2F1JyxcbiAgICBjaGFyczogXCJcXHVBNzM3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYXYnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzlcXHVBNzNCXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYXknLFxuICAgIGNoYXJzOiBcIlxcdUE3M0RcIixcbiAgfSwge1xuICAgIGJhc2U6ICdiJyxcbiAgICBjaGFyczogXCJcXHUyNEQxXFx1RkY0MlxcdTFFMDNcXHUxRTA1XFx1MUUwN1xcdTAxODBcXHUwMTgzXFx1MDI1M1xcdTAxODJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdjJyxcbiAgICBjaGFyczogXCJcXHVGRjQzXFx1MjREMlxcdTAxMDdcXHUwMTA5XFx1MDEwQlxcdTAxMERcXHUwMEU3XFx1MUUwOVxcdTAxODhcXHUwMjNDXFx1QTczRlxcdTIxODRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdkJyxcbiAgICBjaGFyczogXCJcXHUyNEQzXFx1RkY0NFxcdTFFMEJcXHUwMTBGXFx1MUUwRFxcdTFFMTFcXHUxRTEzXFx1MUUwRlxcdTAxMTFcXHUwMThDXFx1MDI1NlxcdTAyNTdcXHUwMThCXFx1MTNFN1xcdTA1MDFcXHVBN0FBXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZGgnLFxuICAgIGNoYXJzOiBcIlxcdTAwRjBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdkeicsXG4gICAgY2hhcnM6IFwiXFx1MDFGM1xcdTAxQzZcIixcbiAgfSwge1xuICAgIGJhc2U6ICdlJyxcbiAgICBjaGFyczogXCJcXHUyNEQ0XFx1RkY0NVxcdTAwRThcXHUwMEU5XFx1MDBFQVxcdTFFQzFcXHUxRUJGXFx1MUVDNVxcdTFFQzNcXHUxRUJEXFx1MDExM1xcdTFFMTVcXHUxRTE3XFx1MDExNVxcdTAxMTdcXHUwMEVCXFx1MUVCQlxcdTAxMUJcXHUwMjA1XFx1MDIwN1xcdTFFQjlcXHUxRUM3XFx1MDIyOVxcdTFFMURcXHUwMTE5XFx1MUUxOVxcdTFFMUJcXHUwMjQ3XFx1MDFERFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2YnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDVcXHVGRjQ2XFx1MUUxRlxcdTAxOTJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmZicsXG4gICAgY2hhcnM6IFwiXFx1RkIwMFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2ZpJyxcbiAgICBjaGFyczogXCJcXHVGQjAxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZmwnLFxuICAgIGNoYXJzOiBcIlxcdUZCMDJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmZmknLFxuICAgIGNoYXJzOiBcIlxcdUZCMDNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmZmwnLFxuICAgIGNoYXJzOiBcIlxcdUZCMDRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdnJyxcbiAgICBjaGFyczogXCJcXHUyNEQ2XFx1RkY0N1xcdTAxRjVcXHUwMTFEXFx1MUUyMVxcdTAxMUZcXHUwMTIxXFx1MDFFN1xcdTAxMjNcXHUwMUU1XFx1MDI2MFxcdUE3QTFcXHVBNzdGXFx1MUQ3OVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2gnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDdcXHVGRjQ4XFx1MDEyNVxcdTFFMjNcXHUxRTI3XFx1MDIxRlxcdTFFMjVcXHUxRTI5XFx1MUUyQlxcdTFFOTZcXHUwMTI3XFx1MkM2OFxcdTJDNzZcXHUwMjY1XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnaHYnLFxuICAgIGNoYXJzOiBcIlxcdTAxOTVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdpJyxcbiAgICBjaGFyczogXCJcXHUyNEQ4XFx1RkY0OVxceEVDXFx4RURcXHhFRVxcdTAxMjlcXHUwMTJCXFx1MDEyRFxceEVGXFx1MUUyRlxcdTFFQzlcXHUwMUQwXFx1MDIwOVxcdTAyMEJcXHUxRUNCXFx1MDEyRlxcdTFFMkRcXHUwMjY4XFx1MDEzMVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2onLFxuICAgIGNoYXJzOiBcIlxcdTI0RDlcXHVGRjRBXFx1MDEzNVxcdTAxRjBcXHUwMjQ5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnaycsXG4gICAgY2hhcnM6IFwiXFx1MjREQVxcdUZGNEJcXHUxRTMxXFx1MDFFOVxcdTFFMzNcXHUwMTM3XFx1MUUzNVxcdTAxOTlcXHUyQzZBXFx1QTc0MVxcdUE3NDNcXHVBNzQ1XFx1QTdBM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ2wnLFxuICAgIGNoYXJzOiBcIlxcdTI0REJcXHVGRjRDXFx1MDE0MFxcdTAxM0FcXHUwMTNFXFx1MUUzN1xcdTFFMzlcXHUwMTNDXFx1MUUzRFxcdTFFM0JcXHUwMTdGXFx1MDE0MlxcdTAxOUFcXHUwMjZCXFx1MkM2MVxcdUE3NDlcXHVBNzgxXFx1QTc0N1xcdTAyNkRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdsaicsXG4gICAgY2hhcnM6IFwiXFx1MDFDOVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ20nLFxuICAgIGNoYXJzOiBcIlxcdTI0RENcXHVGRjREXFx1MUUzRlxcdTFFNDFcXHUxRTQzXFx1MDI3MVxcdTAyNkZcIixcbiAgfSwge1xuICAgIGJhc2U6ICduJyxcbiAgICBjaGFyczogXCJcXHUyNEREXFx1RkY0RVxcdTAxRjlcXHUwMTQ0XFx4RjFcXHUxRTQ1XFx1MDE0OFxcdTFFNDdcXHUwMTQ2XFx1MUU0QlxcdTFFNDlcXHUwMTlFXFx1MDI3MlxcdTAxNDlcXHVBNzkxXFx1QTdBNVxcdTA0M0JcXHUwNTA5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbmonLFxuICAgIGNoYXJzOiBcIlxcdTAxQ0NcIixcbiAgfSwge1xuICAgIGJhc2U6ICdvJyxcbiAgICBjaGFyczogXCJcXHUyNERFXFx1RkY0RlxceEYyXFx4RjNcXHhGNFxcdTFFRDNcXHUxRUQxXFx1MUVEN1xcdTFFRDVcXHhGNVxcdTFFNERcXHUwMjJEXFx1MUU0RlxcdTAxNERcXHUxRTUxXFx1MUU1M1xcdTAxNEZcXHUwMjJGXFx1MDIzMVxceEY2XFx1MDIyQlxcdTFFQ0ZcXHUwMTUxXFx1MDFEMlxcdTAyMERcXHUwMjBGXFx1MDFBMVxcdTFFRERcXHUxRURCXFx1MUVFMVxcdTFFREZcXHUxRUUzXFx1MUVDRFxcdTFFRDlcXHUwMUVCXFx1MDFFRFxceEY4XFx1MDFGRlxcdUE3NEJcXHVBNzREXFx1MDI3NVxcdTAyNTRcXHUxRDExXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnb2UnLFxuICAgIGNoYXJzOiBcIlxcdTAxNTNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdvaScsXG4gICAgY2hhcnM6IFwiXFx1MDFBM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ29vJyxcbiAgICBjaGFyczogXCJcXHVBNzRGXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnb3UnLFxuICAgIGNoYXJzOiBcIlxcdTAyMjNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdwJyxcbiAgICBjaGFyczogXCJcXHUyNERGXFx1RkY1MFxcdTFFNTVcXHUxRTU3XFx1MDFBNVxcdTFEN0RcXHVBNzUxXFx1QTc1M1xcdUE3NTVcXHUwM0MxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAncScsXG4gICAgY2hhcnM6IFwiXFx1MjRFMFxcdUZGNTFcXHUwMjRCXFx1QTc1N1xcdUE3NTlcIixcbiAgfSwge1xuICAgIGJhc2U6ICdyJyxcbiAgICBjaGFyczogXCJcXHUyNEUxXFx1RkY1MlxcdTAxNTVcXHUxRTU5XFx1MDE1OVxcdTAyMTFcXHUwMjEzXFx1MUU1QlxcdTFFNURcXHUwMTU3XFx1MUU1RlxcdTAyNERcXHUwMjdEXFx1QTc1QlxcdUE3QTdcXHVBNzgzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAncycsXG4gICAgY2hhcnM6IFwiXFx1MjRFMlxcdUZGNTNcXHUwMTVCXFx1MUU2NVxcdTAxNURcXHUxRTYxXFx1MDE2MVxcdTFFNjdcXHUxRTYzXFx1MUU2OVxcdTAyMTlcXHUwMTVGXFx1MDIzRlxcdUE3QTlcXHVBNzg1XFx1MUU5QlxcdTAyODJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdzcycsXG4gICAgY2hhcnM6IFwiXFx4REZcIixcbiAgfSwge1xuICAgIGJhc2U6ICd0JyxcbiAgICBjaGFyczogXCJcXHUyNEUzXFx1RkY1NFxcdTFFNkJcXHUxRTk3XFx1MDE2NVxcdTFFNkRcXHUwMjFCXFx1MDE2M1xcdTFFNzFcXHUxRTZGXFx1MDE2N1xcdTAxQURcXHUwMjg4XFx1MkM2NlxcdUE3ODdcIixcbiAgfSwge1xuICAgIGJhc2U6ICd0aCcsXG4gICAgY2hhcnM6IFwiXFx1MDBGRVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3R6JyxcbiAgICBjaGFyczogXCJcXHVBNzI5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndScsXG4gICAgY2hhcnM6IFwiXFx1MjRFNFxcdUZGNTVcXHhGOVxceEZBXFx4RkJcXHUwMTY5XFx1MUU3OVxcdTAxNkJcXHUxRTdCXFx1MDE2RFxceEZDXFx1MDFEQ1xcdTAxRDhcXHUwMUQ2XFx1MDFEQVxcdTFFRTdcXHUwMTZGXFx1MDE3MVxcdTAxRDRcXHUwMjE1XFx1MDIxN1xcdTAxQjBcXHUxRUVCXFx1MUVFOVxcdTFFRUZcXHUxRUVEXFx1MUVGMVxcdTFFRTVcXHUxRTczXFx1MDE3M1xcdTFFNzdcXHUxRTc1XFx1MDI4OVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3YnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTVcXHVGRjU2XFx1MUU3RFxcdTFFN0ZcXHUwMjhCXFx1QTc1RlxcdTAyOENcIixcbiAgfSwge1xuICAgIGJhc2U6ICd2eScsXG4gICAgY2hhcnM6IFwiXFx1QTc2MVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3cnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTZcXHVGRjU3XFx1MUU4MVxcdTFFODNcXHUwMTc1XFx1MUU4N1xcdTFFODVcXHUxRTk4XFx1MUU4OVxcdTJDNzNcIixcbiAgfSwge1xuICAgIGJhc2U6ICd4JyxcbiAgICBjaGFyczogXCJcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAneScsXG4gICAgY2hhcnM6IFwiXFx1MjRFOFxcdUZGNTlcXHUxRUYzXFx4RkRcXHUwMTc3XFx1MUVGOVxcdTAyMzNcXHUxRThGXFx4RkZcXHUxRUY3XFx1MUU5OVxcdTFFRjVcXHUwMUI0XFx1MDI0RlxcdTFFRkZcIixcbiAgfSwge1xuICAgIGJhc2U6ICd6JyxcbiAgICBjaGFyczogXCJcXHUyNEU5XFx1RkY1QVxcdTAxN0FcXHUxRTkxXFx1MDE3Q1xcdTAxN0VcXHUxRTkzXFx1MUU5NVxcdTAxQjZcXHUwMjI1XFx1MDI0MFxcdTJDNkNcXHVBNzYzXCIsXG4gIH1cbl07XG5cbnZhciBkaWFjcml0aWNzTWFwID0ge307XG5mb3IgKHZhciBpID0gMDsgaSA8IHJlcGxhY2VtZW50TGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICB2YXIgY2hhcnMgPSByZXBsYWNlbWVudExpc3RbaV0uY2hhcnM7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgY2hhcnMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICBkaWFjcml0aWNzTWFwW2NoYXJzW2pdXSA9IHJlcGxhY2VtZW50TGlzdFtpXS5iYXNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURpYWNyaXRpY3Moc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvW15cXHUwMDAwLVxcdTAwN2VdL2csIGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gZGlhY3JpdGljc01hcFtjXSB8fCBjO1xuICB9KTtcbn1cbiIsIiFmdW5jdGlvbihlKXtpZihcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSltb2R1bGUuZXhwb3J0cz1lKCk7ZWxzZSBpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFtdLGUpO2Vsc2V7dmFyIHQ7dD1cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzpcInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsP2dsb2JhbDpcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZj9zZWxmOnRoaXMsdC5mbGV4aWJpbGl0eT1lKCl9fShmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbiBlKHQscixsKXtmdW5jdGlvbiBuKGYsaSl7aWYoIXJbZl0pe2lmKCF0W2ZdKXt2YXIgcz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFpJiZzKXJldHVybiBzKGYsITApO2lmKG8pcmV0dXJuIG8oZiwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitmK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgYz1yW2ZdPXtleHBvcnRzOnt9fTt0W2ZdWzBdLmNhbGwoYy5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciByPXRbZl1bMV1bZV07cmV0dXJuIG4ocj9yOmUpfSxjLGMuZXhwb3J0cyxlLHQscixsKX1yZXR1cm4gcltmXS5leHBvcnRzfWZvcih2YXIgbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGY9MDtmPGwubGVuZ3RoO2YrKyluKGxbZl0pO3JldHVybiBufSh7MTpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbihlKXt2YXIgdCxyLGwsbj0tMTtpZihlLmxpbmVzLmxlbmd0aD4xJiZcImZsZXgtc3RhcnRcIj09PWUuc3R5bGUuYWxpZ25Db250ZW50KWZvcih0PTA7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LHQrPWwuY3Jvc3M7ZWxzZSBpZihlLmxpbmVzLmxlbmd0aD4xJiZcImZsZXgtZW5kXCI9PT1lLnN0eWxlLmFsaWduQ29udGVudClmb3IodD1lLmZsZXhTdHlsZS5jcm9zc1NwYWNlO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCx0Kz1sLmNyb3NzO2Vsc2UgaWYoZS5saW5lcy5sZW5ndGg+MSYmXCJjZW50ZXJcIj09PWUuc3R5bGUuYWxpZ25Db250ZW50KWZvcih0PWUuZmxleFN0eWxlLmNyb3NzU3BhY2UvMjtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsdCs9bC5jcm9zcztlbHNlIGlmKGUubGluZXMubGVuZ3RoPjEmJlwic3BhY2UtYmV0d2VlblwiPT09ZS5zdHlsZS5hbGlnbkNvbnRlbnQpZm9yKHI9ZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZS8oZS5saW5lcy5sZW5ndGgtMSksdD0wO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCx0Kz1sLmNyb3NzK3I7ZWxzZSBpZihlLmxpbmVzLmxlbmd0aD4xJiZcInNwYWNlLWFyb3VuZFwiPT09ZS5zdHlsZS5hbGlnbkNvbnRlbnQpZm9yKHI9MiplLmZsZXhTdHlsZS5jcm9zc1NwYWNlLygyKmUubGluZXMubGVuZ3RoKSx0PXIvMjtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsdCs9bC5jcm9zcytyO2Vsc2UgZm9yKHI9ZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZS9lLmxpbmVzLmxlbmd0aCx0PWUuZmxleFN0eWxlLmNyb3NzSW5uZXJCZWZvcmU7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LGwuY3Jvc3MrPXIsdCs9bC5jcm9zc319LHt9XSwyOltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2Zvcih2YXIgdCxyPS0xO2xpbmU9ZS5saW5lc1srK3JdOylmb3IodD0tMTtjaGlsZD1saW5lLmNoaWxkcmVuWysrdF07KXt2YXIgbD1jaGlsZC5zdHlsZS5hbGlnblNlbGY7XCJhdXRvXCI9PT1sJiYobD1lLnN0eWxlLmFsaWduSXRlbXMpLFwiZmxleC1zdGFydFwiPT09bD9jaGlsZC5mbGV4U3R5bGUuY3Jvc3NTdGFydD1saW5lLmNyb3NzU3RhcnQ6XCJmbGV4LWVuZFwiPT09bD9jaGlsZC5mbGV4U3R5bGUuY3Jvc3NTdGFydD1saW5lLmNyb3NzU3RhcnQrbGluZS5jcm9zcy1jaGlsZC5mbGV4U3R5bGUuY3Jvc3NPdXRlcjpcImNlbnRlclwiPT09bD9jaGlsZC5mbGV4U3R5bGUuY3Jvc3NTdGFydD1saW5lLmNyb3NzU3RhcnQrKGxpbmUuY3Jvc3MtY2hpbGQuZmxleFN0eWxlLmNyb3NzT3V0ZXIpLzI6KGNoaWxkLmZsZXhTdHlsZS5jcm9zc1N0YXJ0PWxpbmUuY3Jvc3NTdGFydCxjaGlsZC5mbGV4U3R5bGUuY3Jvc3NPdXRlcj1saW5lLmNyb3NzLGNoaWxkLmZsZXhTdHlsZS5jcm9zcz1jaGlsZC5mbGV4U3R5bGUuY3Jvc3NPdXRlci1jaGlsZC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUtY2hpbGQuZmxleFN0eWxlLmNyb3NzQWZ0ZXIpfX19LHt9XSwzOltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uIGwoZSxsKXt2YXIgdD1cInJvd1wiPT09bHx8XCJyb3ctcmV2ZXJzZVwiPT09bCxyPWUubWFpbkF4aXM7aWYocil7dmFyIG49dCYmXCJpbmxpbmVcIj09PXJ8fCF0JiZcImJsb2NrXCI9PT1yO258fChlLmZsZXhTdHlsZT17bWFpbjplLmZsZXhTdHlsZS5jcm9zcyxjcm9zczplLmZsZXhTdHlsZS5tYWluLG1haW5PZmZzZXQ6ZS5mbGV4U3R5bGUuY3Jvc3NPZmZzZXQsY3Jvc3NPZmZzZXQ6ZS5mbGV4U3R5bGUubWFpbk9mZnNldCxtYWluQmVmb3JlOmUuZmxleFN0eWxlLmNyb3NzQmVmb3JlLG1haW5BZnRlcjplLmZsZXhTdHlsZS5jcm9zc0FmdGVyLGNyb3NzQmVmb3JlOmUuZmxleFN0eWxlLm1haW5CZWZvcmUsY3Jvc3NBZnRlcjplLmZsZXhTdHlsZS5tYWluQWZ0ZXIsbWFpbklubmVyQmVmb3JlOmUuZmxleFN0eWxlLmNyb3NzSW5uZXJCZWZvcmUsbWFpbklubmVyQWZ0ZXI6ZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckFmdGVyLGNyb3NzSW5uZXJCZWZvcmU6ZS5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlLGNyb3NzSW5uZXJBZnRlcjplLmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlcixtYWluQm9yZGVyQmVmb3JlOmUuZmxleFN0eWxlLmNyb3NzQm9yZGVyQmVmb3JlLG1haW5Cb3JkZXJBZnRlcjplLmZsZXhTdHlsZS5jcm9zc0JvcmRlckFmdGVyLGNyb3NzQm9yZGVyQmVmb3JlOmUuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUsY3Jvc3NCb3JkZXJBZnRlcjplLmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXJ9KX1lbHNlIHQ/ZS5mbGV4U3R5bGU9e21haW46ZS5zdHlsZS53aWR0aCxjcm9zczplLnN0eWxlLmhlaWdodCxtYWluT2Zmc2V0OmUuc3R5bGUub2Zmc2V0V2lkdGgsY3Jvc3NPZmZzZXQ6ZS5zdHlsZS5vZmZzZXRIZWlnaHQsbWFpbkJlZm9yZTplLnN0eWxlLm1hcmdpbkxlZnQsbWFpbkFmdGVyOmUuc3R5bGUubWFyZ2luUmlnaHQsY3Jvc3NCZWZvcmU6ZS5zdHlsZS5tYXJnaW5Ub3AsY3Jvc3NBZnRlcjplLnN0eWxlLm1hcmdpbkJvdHRvbSxtYWluSW5uZXJCZWZvcmU6ZS5zdHlsZS5wYWRkaW5nTGVmdCxtYWluSW5uZXJBZnRlcjplLnN0eWxlLnBhZGRpbmdSaWdodCxjcm9zc0lubmVyQmVmb3JlOmUuc3R5bGUucGFkZGluZ1RvcCxjcm9zc0lubmVyQWZ0ZXI6ZS5zdHlsZS5wYWRkaW5nQm90dG9tLG1haW5Cb3JkZXJCZWZvcmU6ZS5zdHlsZS5ib3JkZXJMZWZ0V2lkdGgsbWFpbkJvcmRlckFmdGVyOmUuc3R5bGUuYm9yZGVyUmlnaHRXaWR0aCxjcm9zc0JvcmRlckJlZm9yZTplLnN0eWxlLmJvcmRlclRvcFdpZHRoLGNyb3NzQm9yZGVyQWZ0ZXI6ZS5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aH06ZS5mbGV4U3R5bGU9e21haW46ZS5zdHlsZS5oZWlnaHQsY3Jvc3M6ZS5zdHlsZS53aWR0aCxtYWluT2Zmc2V0OmUuc3R5bGUub2Zmc2V0SGVpZ2h0LGNyb3NzT2Zmc2V0OmUuc3R5bGUub2Zmc2V0V2lkdGgsbWFpbkJlZm9yZTplLnN0eWxlLm1hcmdpblRvcCxtYWluQWZ0ZXI6ZS5zdHlsZS5tYXJnaW5Cb3R0b20sY3Jvc3NCZWZvcmU6ZS5zdHlsZS5tYXJnaW5MZWZ0LGNyb3NzQWZ0ZXI6ZS5zdHlsZS5tYXJnaW5SaWdodCxtYWluSW5uZXJCZWZvcmU6ZS5zdHlsZS5wYWRkaW5nVG9wLG1haW5Jbm5lckFmdGVyOmUuc3R5bGUucGFkZGluZ0JvdHRvbSxjcm9zc0lubmVyQmVmb3JlOmUuc3R5bGUucGFkZGluZ0xlZnQsY3Jvc3NJbm5lckFmdGVyOmUuc3R5bGUucGFkZGluZ1JpZ2h0LG1haW5Cb3JkZXJCZWZvcmU6ZS5zdHlsZS5ib3JkZXJUb3BXaWR0aCxtYWluQm9yZGVyQWZ0ZXI6ZS5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aCxjcm9zc0JvcmRlckJlZm9yZTplLnN0eWxlLmJvcmRlckxlZnRXaWR0aCxjcm9zc0JvcmRlckFmdGVyOmUuc3R5bGUuYm9yZGVyUmlnaHRXaWR0aH0sXCJjb250ZW50LWJveFwiPT09ZS5zdHlsZS5ib3hTaXppbmcmJihcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUubWFpbiYmKGUuZmxleFN0eWxlLm1haW4rPWUuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZStlLmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlcitlLmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlciksXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLmNyb3NzJiYoZS5mbGV4U3R5bGUuY3Jvc3MrPWUuZmxleFN0eWxlLmNyb3NzSW5uZXJCZWZvcmUrZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckFmdGVyK2UuZmxleFN0eWxlLmNyb3NzQm9yZGVyQmVmb3JlK2UuZmxleFN0eWxlLmNyb3NzQm9yZGVyQWZ0ZXIpKTtlLm1haW5BeGlzPXQ/XCJpbmxpbmVcIjpcImJsb2NrXCIsZS5jcm9zc0F4aXM9dD9cImJsb2NrXCI6XCJpbmxpbmVcIixcIm51bWJlclwiPT10eXBlb2YgZS5zdHlsZS5mbGV4QmFzaXMmJihlLmZsZXhTdHlsZS5tYWluPWUuc3R5bGUuZmxleEJhc2lzK2UuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZStlLmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlcitlLmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlciksZS5mbGV4U3R5bGUubWFpbk91dGVyPWUuZmxleFN0eWxlLm1haW4sZS5mbGV4U3R5bGUuY3Jvc3NPdXRlcj1lLmZsZXhTdHlsZS5jcm9zcyxcImF1dG9cIj09PWUuZmxleFN0eWxlLm1haW5PdXRlciYmKGUuZmxleFN0eWxlLm1haW5PdXRlcj1lLmZsZXhTdHlsZS5tYWluT2Zmc2V0KSxcImF1dG9cIj09PWUuZmxleFN0eWxlLmNyb3NzT3V0ZXImJihlLmZsZXhTdHlsZS5jcm9zc091dGVyPWUuZmxleFN0eWxlLmNyb3NzT2Zmc2V0KSxcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUubWFpbkJlZm9yZSYmKGUuZmxleFN0eWxlLm1haW5PdXRlcis9ZS5mbGV4U3R5bGUubWFpbkJlZm9yZSksXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLm1haW5BZnRlciYmKGUuZmxleFN0eWxlLm1haW5PdXRlcis9ZS5mbGV4U3R5bGUubWFpbkFmdGVyKSxcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUmJihlLmZsZXhTdHlsZS5jcm9zc091dGVyKz1lLmZsZXhTdHlsZS5jcm9zc0JlZm9yZSksXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLmNyb3NzQWZ0ZXImJihlLmZsZXhTdHlsZS5jcm9zc091dGVyKz1lLmZsZXhTdHlsZS5jcm9zc0FmdGVyKX19LHt9XSw0OltmdW5jdGlvbihlLHQscil7dmFyIGw9ZShcIi4uL3JlZHVjZVwiKTt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7aWYoZS5tYWluU3BhY2U+MCl7dmFyIHQ9bChlLmNoaWxkcmVuLGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUrcGFyc2VGbG9hdCh0LnN0eWxlLmZsZXhHcm93KX0sMCk7dD4wJiYoZS5tYWluPWwoZS5jaGlsZHJlbixmdW5jdGlvbihyLGwpe3JldHVyblwiYXV0b1wiPT09bC5mbGV4U3R5bGUubWFpbj9sLmZsZXhTdHlsZS5tYWluPWwuZmxleFN0eWxlLm1haW5PZmZzZXQrcGFyc2VGbG9hdChsLnN0eWxlLmZsZXhHcm93KS90KmUubWFpblNwYWNlOmwuZmxleFN0eWxlLm1haW4rPXBhcnNlRmxvYXQobC5zdHlsZS5mbGV4R3JvdykvdCplLm1haW5TcGFjZSxsLmZsZXhTdHlsZS5tYWluT3V0ZXI9bC5mbGV4U3R5bGUubWFpbitsLmZsZXhTdHlsZS5tYWluQmVmb3JlK2wuZmxleFN0eWxlLm1haW5BZnRlcixyK2wuZmxleFN0eWxlLm1haW5PdXRlcn0sMCksZS5tYWluU3BhY2U9MCl9fX0se1wiLi4vcmVkdWNlXCI6MTJ9XSw1OltmdW5jdGlvbihlLHQscil7dmFyIGw9ZShcIi4uL3JlZHVjZVwiKTt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7aWYoZS5tYWluU3BhY2U8MCl7dmFyIHQ9bChlLmNoaWxkcmVuLGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUrcGFyc2VGbG9hdCh0LnN0eWxlLmZsZXhTaHJpbmspfSwwKTt0PjAmJihlLm1haW49bChlLmNoaWxkcmVuLGZ1bmN0aW9uKHIsbCl7cmV0dXJuIGwuZmxleFN0eWxlLm1haW4rPXBhcnNlRmxvYXQobC5zdHlsZS5mbGV4U2hyaW5rKS90KmUubWFpblNwYWNlLGwuZmxleFN0eWxlLm1haW5PdXRlcj1sLmZsZXhTdHlsZS5tYWluK2wuZmxleFN0eWxlLm1haW5CZWZvcmUrbC5mbGV4U3R5bGUubWFpbkFmdGVyLHIrbC5mbGV4U3R5bGUubWFpbk91dGVyfSwwKSxlLm1haW5TcGFjZT0wKX19fSx7XCIuLi9yZWR1Y2VcIjoxMn1dLDY6W2Z1bmN0aW9uKGUsdCxyKXt2YXIgbD1lKFwiLi4vcmVkdWNlXCIpO3QuZXhwb3J0cz1mdW5jdGlvbihlKXt2YXIgdDtlLmxpbmVzPVt0PXttYWluOjAsY3Jvc3M6MCxjaGlsZHJlbjpbXX1dO2Zvcih2YXIgcixuPS0xO3I9ZS5jaGlsZHJlblsrK25dOylcIm5vd3JhcFwiPT09ZS5zdHlsZS5mbGV4V3JhcHx8MD09PXQuY2hpbGRyZW4ubGVuZ3RofHxcImF1dG9cIj09PWUuZmxleFN0eWxlLm1haW58fGUuZmxleFN0eWxlLm1haW4tZS5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlLWUuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyLWUuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUtZS5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyPj10Lm1haW4rci5mbGV4U3R5bGUubWFpbk91dGVyPyh0Lm1haW4rPXIuZmxleFN0eWxlLm1haW5PdXRlcix0LmNyb3NzPU1hdGgubWF4KHQuY3Jvc3Msci5mbGV4U3R5bGUuY3Jvc3NPdXRlcikpOmUubGluZXMucHVzaCh0PXttYWluOnIuZmxleFN0eWxlLm1haW5PdXRlcixjcm9zczpyLmZsZXhTdHlsZS5jcm9zc091dGVyLGNoaWxkcmVuOltdfSksdC5jaGlsZHJlbi5wdXNoKHIpO2UuZmxleFN0eWxlLm1haW5MaW5lcz1sKGUubGluZXMsZnVuY3Rpb24oZSx0KXtyZXR1cm4gTWF0aC5tYXgoZSx0Lm1haW4pfSwwKSxlLmZsZXhTdHlsZS5jcm9zc0xpbmVzPWwoZS5saW5lcyxmdW5jdGlvbihlLHQpe3JldHVybiBlK3QuY3Jvc3N9LDApLFwiYXV0b1wiPT09ZS5mbGV4U3R5bGUubWFpbiYmKGUuZmxleFN0eWxlLm1haW49TWF0aC5tYXgoZS5mbGV4U3R5bGUubWFpbk9mZnNldCxlLmZsZXhTdHlsZS5tYWluTGluZXMrZS5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyKSksXCJhdXRvXCI9PT1lLmZsZXhTdHlsZS5jcm9zcyYmKGUuZmxleFN0eWxlLmNyb3NzPU1hdGgubWF4KGUuZmxleFN0eWxlLmNyb3NzT2Zmc2V0LGUuZmxleFN0eWxlLmNyb3NzTGluZXMrZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckJlZm9yZStlLmZsZXhTdHlsZS5jcm9zc0lubmVyQWZ0ZXIrZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJCZWZvcmUrZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJBZnRlcikpLGUuZmxleFN0eWxlLmNyb3NzU3BhY2U9ZS5mbGV4U3R5bGUuY3Jvc3MtZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckJlZm9yZS1lLmZsZXhTdHlsZS5jcm9zc0lubmVyQWZ0ZXItZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJCZWZvcmUtZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJBZnRlci1lLmZsZXhTdHlsZS5jcm9zc0xpbmVzLGUuZmxleFN0eWxlLm1haW5PdXRlcj1lLmZsZXhTdHlsZS5tYWluK2UuZmxleFN0eWxlLm1haW5CZWZvcmUrZS5mbGV4U3R5bGUubWFpbkFmdGVyLGUuZmxleFN0eWxlLmNyb3NzT3V0ZXI9ZS5mbGV4U3R5bGUuY3Jvc3MrZS5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUrZS5mbGV4U3R5bGUuY3Jvc3NBZnRlcn19LHtcIi4uL3JlZHVjZVwiOjEyfV0sNzpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwodCl7Zm9yKHZhciByLGw9LTE7cj10LmNoaWxkcmVuWysrbF07KWUoXCIuL2ZsZXgtZGlyZWN0aW9uXCIpKHIsdC5zdHlsZS5mbGV4RGlyZWN0aW9uKTtlKFwiLi9mbGV4LWRpcmVjdGlvblwiKSh0LHQuc3R5bGUuZmxleERpcmVjdGlvbiksZShcIi4vb3JkZXJcIikodCksZShcIi4vZmxleGJveC1saW5lc1wiKSh0KSxlKFwiLi9hbGlnbi1jb250ZW50XCIpKHQpLGw9LTE7Zm9yKHZhciBuO249dC5saW5lc1srK2xdOyluLm1haW5TcGFjZT10LmZsZXhTdHlsZS5tYWluLXQuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZS10LmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlci10LmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlLXQuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlci1uLm1haW4sZShcIi4vZmxleC1ncm93XCIpKG4pLGUoXCIuL2ZsZXgtc2hyaW5rXCIpKG4pLGUoXCIuL21hcmdpbi1tYWluXCIpKG4pLGUoXCIuL21hcmdpbi1jcm9zc1wiKShuKSxlKFwiLi9qdXN0aWZ5LWNvbnRlbnRcIikobix0LnN0eWxlLmp1c3RpZnlDb250ZW50LHQpO2UoXCIuL2FsaWduLWl0ZW1zXCIpKHQpfXQuZXhwb3J0cz1sfSx7XCIuL2FsaWduLWNvbnRlbnRcIjoxLFwiLi9hbGlnbi1pdGVtc1wiOjIsXCIuL2ZsZXgtZGlyZWN0aW9uXCI6MyxcIi4vZmxleC1ncm93XCI6NCxcIi4vZmxleC1zaHJpbmtcIjo1LFwiLi9mbGV4Ym94LWxpbmVzXCI6NixcIi4vanVzdGlmeS1jb250ZW50XCI6OCxcIi4vbWFyZ2luLWNyb3NzXCI6OSxcIi4vbWFyZ2luLW1haW5cIjoxMCxcIi4vb3JkZXJcIjoxMX1dLDg6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBsLG4sbyxmPXIuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZSxpPS0xO2lmKFwiZmxleC1lbmRcIj09PXQpZm9yKGw9ZS5tYWluU3BhY2UsbCs9ZjtvPWUuY2hpbGRyZW5bKytpXTspby5mbGV4U3R5bGUubWFpblN0YXJ0PWwsbCs9by5mbGV4U3R5bGUubWFpbk91dGVyO2Vsc2UgaWYoXCJjZW50ZXJcIj09PXQpZm9yKGw9ZS5tYWluU3BhY2UvMixsKz1mO289ZS5jaGlsZHJlblsrK2ldOylvLmZsZXhTdHlsZS5tYWluU3RhcnQ9bCxsKz1vLmZsZXhTdHlsZS5tYWluT3V0ZXI7ZWxzZSBpZihcInNwYWNlLWJldHdlZW5cIj09PXQpZm9yKG49ZS5tYWluU3BhY2UvKGUuY2hpbGRyZW4ubGVuZ3RoLTEpLGw9MCxsKz1mO289ZS5jaGlsZHJlblsrK2ldOylvLmZsZXhTdHlsZS5tYWluU3RhcnQ9bCxsKz1vLmZsZXhTdHlsZS5tYWluT3V0ZXIrbjtlbHNlIGlmKFwic3BhY2UtYXJvdW5kXCI9PT10KWZvcihuPTIqZS5tYWluU3BhY2UvKDIqZS5jaGlsZHJlbi5sZW5ndGgpLGw9bi8yLGwrPWY7bz1lLmNoaWxkcmVuWysraV07KW8uZmxleFN0eWxlLm1haW5TdGFydD1sLGwrPW8uZmxleFN0eWxlLm1haW5PdXRlcituO2Vsc2UgZm9yKGw9MCxsKz1mO289ZS5jaGlsZHJlblsrK2ldOylvLmZsZXhTdHlsZS5tYWluU3RhcnQ9bCxsKz1vLmZsZXhTdHlsZS5tYWluT3V0ZXJ9fSx7fV0sOTpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbihlKXtmb3IodmFyIHQscj0tMTt0PWUuY2hpbGRyZW5bKytyXTspe3ZhciBsPTA7XCJhdXRvXCI9PT10LmZsZXhTdHlsZS5jcm9zc0JlZm9yZSYmKytsLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUuY3Jvc3NBZnRlciYmKytsO3ZhciBuPWUuY3Jvc3MtdC5mbGV4U3R5bGUuY3Jvc3NPdXRlcjtcImF1dG9cIj09PXQuZmxleFN0eWxlLmNyb3NzQmVmb3JlJiYodC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmU9bi9sKSxcImF1dG9cIj09PXQuZmxleFN0eWxlLmNyb3NzQWZ0ZXImJih0LmZsZXhTdHlsZS5jcm9zc0FmdGVyPW4vbCksXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5jcm9zcz90LmZsZXhTdHlsZS5jcm9zc091dGVyPXQuZmxleFN0eWxlLmNyb3NzT2Zmc2V0K3QuZmxleFN0eWxlLmNyb3NzQmVmb3JlK3QuZmxleFN0eWxlLmNyb3NzQWZ0ZXI6dC5mbGV4U3R5bGUuY3Jvc3NPdXRlcj10LmZsZXhTdHlsZS5jcm9zcyt0LmZsZXhTdHlsZS5jcm9zc0JlZm9yZSt0LmZsZXhTdHlsZS5jcm9zc0FmdGVyfX19LHt9XSwxMDpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbihlKXtmb3IodmFyIHQscj0wLGw9LTE7dD1lLmNoaWxkcmVuWysrbF07KVwiYXV0b1wiPT09dC5mbGV4U3R5bGUubWFpbkJlZm9yZSYmKytyLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUubWFpbkFmdGVyJiYrK3I7aWYocj4wKXtmb3IobD0tMTt0PWUuY2hpbGRyZW5bKytsXTspXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5tYWluQmVmb3JlJiYodC5mbGV4U3R5bGUubWFpbkJlZm9yZT1lLm1haW5TcGFjZS9yKSxcImF1dG9cIj09PXQuZmxleFN0eWxlLm1haW5BZnRlciYmKHQuZmxleFN0eWxlLm1haW5BZnRlcj1lLm1haW5TcGFjZS9yKSxcImF1dG9cIj09PXQuZmxleFN0eWxlLm1haW4/dC5mbGV4U3R5bGUubWFpbk91dGVyPXQuZmxleFN0eWxlLm1haW5PZmZzZXQrdC5mbGV4U3R5bGUubWFpbkJlZm9yZSt0LmZsZXhTdHlsZS5tYWluQWZ0ZXI6dC5mbGV4U3R5bGUubWFpbk91dGVyPXQuZmxleFN0eWxlLm1haW4rdC5mbGV4U3R5bGUubWFpbkJlZm9yZSt0LmZsZXhTdHlsZS5tYWluQWZ0ZXI7ZS5tYWluU3BhY2U9MH19fSx7fV0sMTE6W2Z1bmN0aW9uKGUsdCxyKXt2YXIgbD0vXihjb2x1bW58cm93KS1yZXZlcnNlJC87dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2UuY2hpbGRyZW4uc29ydChmdW5jdGlvbihlLHQpe3JldHVybiBlLnN0eWxlLm9yZGVyLXQuc3R5bGUub3JkZXJ8fGUuaW5kZXgtdC5pbmRleH0pLGwudGVzdChlLnN0eWxlLmZsZXhEaXJlY3Rpb24pJiZlLmNoaWxkcmVuLnJldmVyc2UoKX19LHt9XSwxMjpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSx0LHIpe2Zvcih2YXIgbD1lLmxlbmd0aCxuPS0xOysrbjxsOyluIGluIGUmJihyPXQocixlW25dLG4pKTtyZXR1cm4gcn10LmV4cG9ydHM9bH0se31dLDEzOltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlKXtpKGYoZSkpfXZhciBuPWUoXCIuL3JlYWRcIiksbz1lKFwiLi93cml0ZVwiKSxmPWUoXCIuL3JlYWRBbGxcIiksaT1lKFwiLi93cml0ZUFsbFwiKTt0LmV4cG9ydHM9bCx0LmV4cG9ydHMucmVhZD1uLHQuZXhwb3J0cy53cml0ZT1vLHQuZXhwb3J0cy5yZWFkQWxsPWYsdC5leHBvcnRzLndyaXRlQWxsPWl9LHtcIi4vcmVhZFwiOjE1LFwiLi9yZWFkQWxsXCI6MTYsXCIuL3dyaXRlXCI6MTcsXCIuL3dyaXRlQWxsXCI6MTh9XSwxNDpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSx0LHIpe3ZhciBsPWVbdF0sZj1TdHJpbmcobCkubWF0Y2gobyk7aWYoIWYpe3ZhciBhPXQubWF0Y2gocyk7aWYoYSl7dmFyIGM9ZVtcImJvcmRlclwiK2FbMV0rXCJTdHlsZVwiXTtyZXR1cm5cIm5vbmVcIj09PWM/MDppW2xdfHwwfXJldHVybiBsfXZhciB5PWZbMV0seD1mWzJdO3JldHVyblwicHhcIj09PXg/MSp5OlwiY21cIj09PXg/LjM5MzcqeSo5NjpcImluXCI9PT14Pzk2Knk6XCJtbVwiPT09eD8uMzkzNyp5Kjk2LzEwOlwicGNcIj09PXg/MTIqeSo5Ni83MjpcInB0XCI9PT14Pzk2KnkvNzI6XCJyZW1cIj09PXg/MTYqeTpuKGwscil9ZnVuY3Rpb24gbihlLHQpe2Yuc3R5bGUuY3NzVGV4dD1cImJvcmRlcjpub25lIWltcG9ydGFudDtjbGlwOnJlY3QoMCAwIDAgMCkhaW1wb3J0YW50O2Rpc3BsYXk6YmxvY2shaW1wb3J0YW50O2ZvbnQtc2l6ZToxZW0haW1wb3J0YW50O2hlaWdodDowIWltcG9ydGFudDttYXJnaW46MCFpbXBvcnRhbnQ7cGFkZGluZzowIWltcG9ydGFudDtwb3NpdGlvbjpyZWxhdGl2ZSFpbXBvcnRhbnQ7d2lkdGg6XCIrZStcIiFpbXBvcnRhbnRcIix0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGYsdC5uZXh0U2libGluZyk7dmFyIHI9Zi5vZmZzZXRXaWR0aDtyZXR1cm4gdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGYpLHJ9dC5leHBvcnRzPWw7dmFyIG89L14oWy0rXT9cXGQqXFwuP1xcZCspKCV8W2Etel0rKSQvLGY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxpPXttZWRpdW06NCxub25lOjAsdGhpY2s6Nix0aGluOjJ9LHM9L15ib3JkZXIoQm90dG9tfExlZnR8UmlnaHR8VG9wKVdpZHRoJC99LHt9XSwxNTpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSl7dmFyIHQ9e2FsaWduQ29udGVudDpcInN0cmV0Y2hcIixhbGlnbkl0ZW1zOlwic3RyZXRjaFwiLGFsaWduU2VsZjpcImF1dG9cIixib3JkZXJCb3R0b21TdHlsZTpcIm5vbmVcIixib3JkZXJCb3R0b21XaWR0aDowLGJvcmRlckxlZnRTdHlsZTpcIm5vbmVcIixib3JkZXJMZWZ0V2lkdGg6MCxib3JkZXJSaWdodFN0eWxlOlwibm9uZVwiLGJvcmRlclJpZ2h0V2lkdGg6MCxib3JkZXJUb3BTdHlsZTpcIm5vbmVcIixib3JkZXJUb3BXaWR0aDowLGJveFNpemluZzpcImNvbnRlbnQtYm94XCIsZGlzcGxheTpcImlubGluZVwiLGZsZXhCYXNpczpcImF1dG9cIixmbGV4RGlyZWN0aW9uOlwicm93XCIsZmxleEdyb3c6MCxmbGV4U2hyaW5rOjEsZmxleFdyYXA6XCJub3dyYXBcIixqdXN0aWZ5Q29udGVudDpcImZsZXgtc3RhcnRcIixoZWlnaHQ6XCJhdXRvXCIsbWFyZ2luVG9wOjAsbWFyZ2luUmlnaHQ6MCxtYXJnaW5MZWZ0OjAsbWFyZ2luQm90dG9tOjAscGFkZGluZ1RvcDowLHBhZGRpbmdSaWdodDowLHBhZGRpbmdMZWZ0OjAscGFkZGluZ0JvdHRvbTowLG1heEhlaWdodDpcIm5vbmVcIixtYXhXaWR0aDpcIm5vbmVcIixtaW5IZWlnaHQ6MCxtaW5XaWR0aDowLG9yZGVyOjAscG9zaXRpb246XCJzdGF0aWNcIix3aWR0aDpcImF1dG9cIn0scj1lIGluc3RhbmNlb2YgRWxlbWVudDtpZihyKXt2YXIgbD1lLmhhc0F0dHJpYnV0ZShcImRhdGEtc3R5bGVcIiksaT1sP2UuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdHlsZVwiKTplLmdldEF0dHJpYnV0ZShcInN0eWxlXCIpfHxcIlwiO2x8fGUuc2V0QXR0cmlidXRlKFwiZGF0YS1zdHlsZVwiLGkpO3ZhciBzPXdpbmRvdy5nZXRDb21wdXRlZFN0eWxlJiZnZXRDb21wdXRlZFN0eWxlKGUpfHx7fTtmKHQscyk7dmFyIGM9ZS5jdXJyZW50U3R5bGV8fHt9O24odCxjKSxvKHQsaSk7Zm9yKHZhciB5IGluIHQpdFt5XT1hKHQseSxlKTt2YXIgeD1lLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO3Qub2Zmc2V0SGVpZ2h0PXguaGVpZ2h0fHxlLm9mZnNldEhlaWdodCx0Lm9mZnNldFdpZHRoPXgud2lkdGh8fGUub2Zmc2V0V2lkdGh9dmFyIFM9e2VsZW1lbnQ6ZSxzdHlsZTp0fTtyZXR1cm4gU31mdW5jdGlvbiBuKGUsdCl7Zm9yKHZhciByIGluIGUpe3ZhciBsPXIgaW4gdDtpZihsKWVbcl09dFtyXTtlbHNle3ZhciBuPXIucmVwbGFjZSgvW0EtWl0vZyxcIi0kJlwiKS50b0xvd2VyQ2FzZSgpLG89biBpbiB0O28mJihlW3JdPXRbbl0pfX12YXIgZj1cIi1qcy1kaXNwbGF5XCJpbiB0O2YmJihlLmRpc3BsYXk9dFtcIi1qcy1kaXNwbGF5XCJdKX1mdW5jdGlvbiBvKGUsdCl7Zm9yKHZhciByO3I9aS5leGVjKHQpOyl7dmFyIGw9clsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLy1bYS16XS9nLGZ1bmN0aW9uKGUpe3JldHVybiBlLnNsaWNlKDEpLnRvVXBwZXJDYXNlKCl9KTtlW2xdPXJbMl19fWZ1bmN0aW9uIGYoZSx0KXtmb3IodmFyIHIgaW4gZSl7dmFyIGw9ciBpbiB0O2wmJiFzLnRlc3QocikmJihlW3JdPXRbcl0pfX10LmV4cG9ydHM9bDt2YXIgaT0vKFteXFxzOjtdKylcXHMqOlxccyooW147XSs/KVxccyooO3wkKS9nLHM9L14oYWxpZ25TZWxmfGhlaWdodHx3aWR0aCkkLyxhPWUoXCIuL2dldENvbXB1dGVkTGVuZ3RoXCIpfSx7XCIuL2dldENvbXB1dGVkTGVuZ3RoXCI6MTR9XSwxNjpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSl7dmFyIHQ9W107cmV0dXJuIG4oZSx0KSx0fWZ1bmN0aW9uIG4oZSx0KXtmb3IodmFyIHIsbD1vKGUpLGk9W10scz0tMTtyPWUuY2hpbGROb2Rlc1srK3NdOyl7dmFyIGE9Mz09PXIubm9kZVR5cGUmJiEvXlxccyokLy50ZXN0KHIubm9kZVZhbHVlKTtpZihsJiZhKXt2YXIgYz1yO3I9ZS5pbnNlcnRCZWZvcmUoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImZsZXgtaXRlbVwiKSxjKSxyLmFwcGVuZENoaWxkKGMpfXZhciB5PXIgaW5zdGFuY2VvZiBFbGVtZW50O2lmKHkpe3ZhciB4PW4ocix0KTtpZihsKXt2YXIgUz1yLnN0eWxlO1MuZGlzcGxheT1cImlubGluZS1ibG9ja1wiLFMucG9zaXRpb249XCJhYnNvbHV0ZVwiLHguc3R5bGU9ZihyKS5zdHlsZSxpLnB1c2goeCl9fX12YXIgbT17ZWxlbWVudDplLGNoaWxkcmVuOml9O3JldHVybiBsJiYobS5zdHlsZT1mKGUpLnN0eWxlLHQucHVzaChtKSksbX1mdW5jdGlvbiBvKGUpe3ZhciB0PWUgaW5zdGFuY2VvZiBFbGVtZW50LHI9dCYmZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0eWxlXCIpLGw9dCYmZS5jdXJyZW50U3R5bGUmJmUuY3VycmVudFN0eWxlW1wiLWpzLWRpc3BsYXlcIl0sbj1pLnRlc3Qocil8fHMudGVzdChsKTtyZXR1cm4gbn10LmV4cG9ydHM9bDt2YXIgZj1lKFwiLi4vcmVhZFwiKSxpPS8oXnw7KVxccypkaXNwbGF5XFxzKjpcXHMqKGlubGluZS0pP2ZsZXhcXHMqKDt8JCkvaSxzPS9eKGlubGluZS0pP2ZsZXgkL2l9LHtcIi4uL3JlYWRcIjoxNX1dLDE3OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlKXtvKGUpO3ZhciB0PWUuZWxlbWVudC5zdHlsZSxyPVwiaW5saW5lXCI9PT1lLm1haW5BeGlzP1tcIm1haW5cIixcImNyb3NzXCJdOltcImNyb3NzXCIsXCJtYWluXCJdO3QuYm94U2l6aW5nPVwiY29udGVudC1ib3hcIix0LmRpc3BsYXk9XCJibG9ja1wiLHQucG9zaXRpb249XCJyZWxhdGl2ZVwiLHQud2lkdGg9bihlLmZsZXhTdHlsZVtyWzBdXS1lLmZsZXhTdHlsZVtyWzBdK1wiSW5uZXJCZWZvcmVcIl0tZS5mbGV4U3R5bGVbclswXStcIklubmVyQWZ0ZXJcIl0tZS5mbGV4U3R5bGVbclswXStcIkJvcmRlckJlZm9yZVwiXS1lLmZsZXhTdHlsZVtyWzBdK1wiQm9yZGVyQWZ0ZXJcIl0pLHQuaGVpZ2h0PW4oZS5mbGV4U3R5bGVbclsxXV0tZS5mbGV4U3R5bGVbclsxXStcIklubmVyQmVmb3JlXCJdLWUuZmxleFN0eWxlW3JbMV0rXCJJbm5lckFmdGVyXCJdLWUuZmxleFN0eWxlW3JbMV0rXCJCb3JkZXJCZWZvcmVcIl0tZS5mbGV4U3R5bGVbclsxXStcIkJvcmRlckFmdGVyXCJdKTtmb3IodmFyIGwsZj0tMTtsPWUuY2hpbGRyZW5bKytmXTspe3ZhciBpPWwuZWxlbWVudC5zdHlsZSxzPVwiaW5saW5lXCI9PT1sLm1haW5BeGlzP1tcIm1haW5cIixcImNyb3NzXCJdOltcImNyb3NzXCIsXCJtYWluXCJdO2kuYm94U2l6aW5nPVwiY29udGVudC1ib3hcIixpLmRpc3BsYXk9XCJibG9ja1wiLGkucG9zaXRpb249XCJhYnNvbHV0ZVwiLFwiYXV0b1wiIT09bC5mbGV4U3R5bGVbc1swXV0mJihpLndpZHRoPW4obC5mbGV4U3R5bGVbc1swXV0tbC5mbGV4U3R5bGVbc1swXStcIklubmVyQmVmb3JlXCJdLWwuZmxleFN0eWxlW3NbMF0rXCJJbm5lckFmdGVyXCJdLWwuZmxleFN0eWxlW3NbMF0rXCJCb3JkZXJCZWZvcmVcIl0tbC5mbGV4U3R5bGVbc1swXStcIkJvcmRlckFmdGVyXCJdKSksXCJhdXRvXCIhPT1sLmZsZXhTdHlsZVtzWzFdXSYmKGkuaGVpZ2h0PW4obC5mbGV4U3R5bGVbc1sxXV0tbC5mbGV4U3R5bGVbc1sxXStcIklubmVyQmVmb3JlXCJdLWwuZmxleFN0eWxlW3NbMV0rXCJJbm5lckFmdGVyXCJdLWwuZmxleFN0eWxlW3NbMV0rXCJCb3JkZXJCZWZvcmVcIl0tbC5mbGV4U3R5bGVbc1sxXStcIkJvcmRlckFmdGVyXCJdKSksaS50b3A9bihsLmZsZXhTdHlsZVtzWzFdK1wiU3RhcnRcIl0pLGkubGVmdD1uKGwuZmxleFN0eWxlW3NbMF0rXCJTdGFydFwiXSksaS5tYXJnaW5Ub3A9bihsLmZsZXhTdHlsZVtzWzFdK1wiQmVmb3JlXCJdKSxpLm1hcmdpblJpZ2h0PW4obC5mbGV4U3R5bGVbc1swXStcIkFmdGVyXCJdKSxpLm1hcmdpbkJvdHRvbT1uKGwuZmxleFN0eWxlW3NbMV0rXCJBZnRlclwiXSksaS5tYXJnaW5MZWZ0PW4obC5mbGV4U3R5bGVbc1swXStcIkJlZm9yZVwiXSl9fWZ1bmN0aW9uIG4oZSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/ZTpNYXRoLm1heChlLDApK1wicHhcIn10LmV4cG9ydHM9bDt2YXIgbz1lKFwiLi4vZmxleGJveFwiKX0se1wiLi4vZmxleGJveFwiOjd9XSwxODpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSl7Zm9yKHZhciB0LHI9LTE7dD1lWysrcl07KW4odCl9dC5leHBvcnRzPWw7dmFyIG49ZShcIi4uL3dyaXRlXCIpfSx7XCIuLi93cml0ZVwiOjE3fV19LHt9LFsxM10pKDEzKX0pOyIsIi8qXG4gKiBGdXp6eVxuICogaHR0cHM6Ly9naXRodWIuY29tL215b3JrL2Z1enp5XG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyIE1hdHQgWW9ya1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbigpIHtcblxudmFyIHJvb3QgPSB0aGlzO1xuXG52YXIgZnV6enkgPSB7fTtcblxuLy8gVXNlIGluIG5vZGUgb3IgaW4gYnJvd3NlclxuaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1enp5O1xufSBlbHNlIHtcbiAgcm9vdC5mdXp6eSA9IGZ1enp5O1xufVxuXG4vLyBSZXR1cm4gYWxsIGVsZW1lbnRzIG9mIGBhcnJheWAgdGhhdCBoYXZlIGEgZnV6enlcbi8vIG1hdGNoIGFnYWluc3QgYHBhdHRlcm5gLlxuZnV6enkuc2ltcGxlRmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihzdHJpbmcpIHtcbiAgICByZXR1cm4gZnV6enkudGVzdChwYXR0ZXJuLCBzdHJpbmcpO1xuICB9KTtcbn07XG5cbi8vIERvZXMgYHBhdHRlcm5gIGZ1enp5IG1hdGNoIGBzdHJpbmdgP1xuZnV6enkudGVzdCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cmluZykge1xuICByZXR1cm4gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyaW5nKSAhPT0gbnVsbDtcbn07XG5cbi8vIElmIGBwYXR0ZXJuYCBtYXRjaGVzIGBzdHJpbmdgLCB3cmFwIGVhY2ggbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyBpbiBgb3B0cy5wcmVgIGFuZCBgb3B0cy5wb3N0YC4gSWYgbm8gbWF0Y2gsIHJldHVybiBudWxsXG5mdXp6eS5tYXRjaCA9IGZ1bmN0aW9uKHBhdHRlcm4sIHN0cmluZywgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgdmFyIHBhdHRlcm5JZHggPSAwXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgbGVuID0gc3RyaW5nLmxlbmd0aFxuICAgICwgdG90YWxTY29yZSA9IDBcbiAgICAsIGN1cnJTY29yZSA9IDBcbiAgICAvLyBwcmVmaXhcbiAgICAsIHByZSA9IG9wdHMucHJlIHx8ICcnXG4gICAgLy8gc3VmZml4XG4gICAgLCBwb3N0ID0gb3B0cy5wb3N0IHx8ICcnXG4gICAgLy8gU3RyaW5nIHRvIGNvbXBhcmUgYWdhaW5zdC4gVGhpcyBtaWdodCBiZSBhIGxvd2VyY2FzZSB2ZXJzaW9uIG9mIHRoZVxuICAgIC8vIHJhdyBzdHJpbmdcbiAgICAsIGNvbXBhcmVTdHJpbmcgPSAgb3B0cy5jYXNlU2Vuc2l0aXZlICYmIHN0cmluZyB8fCBzdHJpbmcudG9Mb3dlckNhc2UoKVxuICAgICwgY2gsIGNvbXBhcmVDaGFyO1xuXG4gIHBhdHRlcm4gPSBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgcGF0dGVybiB8fCBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gRm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcsIGVpdGhlciBhZGQgaXQgdG8gdGhlIHJlc3VsdFxuICAvLyBvciB3cmFwIGluIHRlbXBsYXRlIGlmIGl0J3MgdGhlIG5leHQgc3RyaW5nIGluIHRoZSBwYXR0ZXJuXG4gIGZvcih2YXIgaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgIGNoID0gc3RyaW5nW2lkeF07XG4gICAgaWYoY29tcGFyZVN0cmluZ1tpZHhdID09PSBwYXR0ZXJuW3BhdHRlcm5JZHhdKSB7XG4gICAgICBjaCA9IHByZSArIGNoICsgcG9zdDtcbiAgICAgIHBhdHRlcm5JZHggKz0gMTtcblxuICAgICAgLy8gY29uc2VjdXRpdmUgY2hhcmFjdGVycyBzaG91bGQgaW5jcmVhc2UgdGhlIHNjb3JlIG1vcmUgdGhhbiBsaW5lYXJseVxuICAgICAgY3VyclNjb3JlICs9IDEgKyBjdXJyU2NvcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJTY29yZSA9IDA7XG4gICAgfVxuICAgIHRvdGFsU2NvcmUgKz0gY3VyclNjb3JlO1xuICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGNoO1xuICB9XG5cbiAgLy8gcmV0dXJuIHJlbmRlcmVkIHN0cmluZyBpZiB3ZSBoYXZlIGEgbWF0Y2ggZm9yIGV2ZXJ5IGNoYXJcbiAgaWYocGF0dGVybklkeCA9PT0gcGF0dGVybi5sZW5ndGgpIHtcbiAgICByZXR1cm4ge3JlbmRlcmVkOiByZXN1bHQuam9pbignJyksIHNjb3JlOiB0b3RhbFNjb3JlfTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuLy8gVGhlIG5vcm1hbCBlbnRyeSBwb2ludC4gRmlsdGVycyBgYXJyYCBmb3IgbWF0Y2hlcyBhZ2FpbnN0IGBwYXR0ZXJuYC5cbi8vIEl0IHJldHVybnMgYW4gYXJyYXkgd2l0aCBtYXRjaGluZyB2YWx1ZXMgb2YgdGhlIHR5cGU6XG4vL1xuLy8gICAgIFt7XG4vLyAgICAgICAgIHN0cmluZzogICAnPGI+bGFoJyAvLyBUaGUgcmVuZGVyZWQgc3RyaW5nXG4vLyAgICAgICAsIGluZGV4OiAgICAyICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICAgICwgb3JpZ2luYWw6ICdibGFoJyAgIC8vIFRoZSBvcmlnaW5hbCBlbGVtZW50IGluIGBhcnJgXG4vLyAgICAgfV1cbi8vXG4vLyBgb3B0c2AgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgYmFnLiBEZXRhaWxzOlxuLy9cbi8vICAgIG9wdHMgPSB7XG4vLyAgICAgICAgLy8gc3RyaW5nIHRvIHB1dCBiZWZvcmUgYSBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vICAgICAgICBwcmU6ICAgICAnPGI+J1xuLy9cbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGFmdGVyIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAsIHBvc3Q6ICAgICc8L2I+J1xuLy9cbi8vICAgICAgICAvLyBPcHRpb25hbCBmdW5jdGlvbi4gSW5wdXQgaXMgYW4gZW50cnkgaW4gdGhlIGdpdmVuIGFycmAsXG4vLyAgICAgICAgLy8gb3V0cHV0IHNob3VsZCBiZSB0aGUgc3RyaW5nIHRvIHRlc3QgYHBhdHRlcm5gIGFnYWluc3QuXG4vLyAgICAgICAgLy8gSW4gdGhpcyBleGFtcGxlLCBpZiBgYXJyID0gW3tjcnlpbmc6ICdrb2FsYSd9XWAgd2Ugd291bGQgcmV0dXJuXG4vLyAgICAgICAgLy8gJ2tvYWxhJy5cbi8vICAgICAgLCBleHRyYWN0OiBmdW5jdGlvbihhcmcpIHsgcmV0dXJuIGFyZy5jcnlpbmc7IH1cbi8vICAgIH1cbmZ1enp5LmZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFyciwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgcmV0dXJuIGFyclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgZWxlbWVudCwgaWR4LCBhcnIpIHtcbiAgICAgIHZhciBzdHIgPSBlbGVtZW50O1xuICAgICAgaWYob3B0cy5leHRyYWN0KSB7XG4gICAgICAgIHN0ciA9IG9wdHMuZXh0cmFjdChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHZhciByZW5kZXJlZCA9IGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0ciwgb3B0cyk7XG4gICAgICBpZihyZW5kZXJlZCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZbcHJldi5sZW5ndGhdID0ge1xuICAgICAgICAgICAgc3RyaW5nOiByZW5kZXJlZC5yZW5kZXJlZFxuICAgICAgICAgICwgc2NvcmU6IHJlbmRlcmVkLnNjb3JlXG4gICAgICAgICAgLCBpbmRleDogaWR4XG4gICAgICAgICAgLCBvcmlnaW5hbDogZWxlbWVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwgW10pXG5cbiAgICAvLyBTb3J0IGJ5IHNjb3JlLiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IHdydCBzdGFibGUvdW5zdGFibGVcbiAgICAvLyBzb3J0aW5nLCBzbyBmb3JjZSBzdGFibGUgYnkgdXNpbmcgdGhlIGluZGV4IGluIHRoZSBjYXNlIG9mIHRpZS5cbiAgICAvLyBTZWUgaHR0cDovL29mYi5uZXQvfnNldGhtbC9pcy1zb3J0LXN0YWJsZS5odG1sXG4gICAgLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgICB2YXIgY29tcGFyZSA9IGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgaWYoY29tcGFyZSkgcmV0dXJuIGNvbXBhcmU7XG4gICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgfSk7XG59O1xuXG5cbn0oKSk7XG5cbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gbGVmdFBhZDtcblxudmFyIGNhY2hlID0gW1xuICAnJyxcbiAgJyAnLFxuICAnICAnLFxuICAnICAgJyxcbiAgJyAgICAnLFxuICAnICAgICAnLFxuICAnICAgICAgJyxcbiAgJyAgICAgICAnLFxuICAnICAgICAgICAnLFxuICAnICAgICAgICAgJ1xuXTtcblxuZnVuY3Rpb24gbGVmdFBhZCAoc3RyLCBsZW4sIGNoKSB7XG4gIC8vIGNvbnZlcnQgYHN0cmAgdG8gYHN0cmluZ2BcbiAgc3RyID0gc3RyICsgJyc7XG4gIC8vIGBsZW5gIGlzIHRoZSBgcGFkYCdzIGxlbmd0aCBub3dcbiAgbGVuID0gbGVuIC0gc3RyLmxlbmd0aDtcbiAgLy8gZG9lc24ndCBuZWVkIHRvIHBhZFxuICBpZiAobGVuIDw9IDApIHJldHVybiBzdHI7XG4gIC8vIGBjaGAgZGVmYXVsdHMgdG8gYCcgJ2BcbiAgaWYgKCFjaCAmJiBjaCAhPT0gMCkgY2ggPSAnICc7XG4gIC8vIGNvbnZlcnQgYGNoYCB0byBgc3RyaW5nYFxuICBjaCA9IGNoICsgJyc7XG4gIC8vIGNhY2hlIGNvbW1vbiB1c2UgY2FzZXNcbiAgaWYgKGNoID09PSAnICcgJiYgbGVuIDwgMTApIHJldHVybiBjYWNoZVtsZW5dICsgc3RyO1xuICAvLyBgcGFkYCBzdGFydHMgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbiAgdmFyIHBhZCA9ICcnO1xuICAvLyBsb29wXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgLy8gYWRkIGBjaGAgdG8gYHBhZGAgaWYgYGxlbmAgaXMgb2RkXG4gICAgaWYgKGxlbiAmIDEpIHBhZCArPSBjaDtcbiAgICAvLyBkZXZpZGUgYGxlbmAgYnkgMiwgZGl0Y2ggdGhlIGZyYWN0aW9uXG4gICAgbGVuID4+PSAxO1xuICAgIC8vIFwiZG91YmxlXCIgdGhlIGBjaGAgc28gdGhpcyBvcGVyYXRpb24gY291bnQgZ3Jvd3MgbG9nYXJpdGhtaWNhbGx5IG9uIGBsZW5gXG4gICAgLy8gZWFjaCB0aW1lIGBjaGAgaXMgXCJkb3VibGVkXCIsIHRoZSBgbGVuYCB3b3VsZCBuZWVkIHRvIGJlIFwiZG91YmxlZFwiIHRvb1xuICAgIC8vIHNpbWlsYXIgdG8gZmluZGluZyBhIHZhbHVlIGluIGJpbmFyeSBzZWFyY2ggdHJlZSwgaGVuY2UgTyhsb2cobikpXG4gICAgaWYgKGxlbikgY2ggKz0gY2g7XG4gICAgLy8gYGxlbmAgaXMgMCwgZXhpdCB0aGUgbG9vcFxuICAgIGVsc2UgYnJlYWs7XG4gIH1cbiAgLy8gcGFkIGBzdHJgIVxuICByZXR1cm4gcGFkICsgc3RyO1xufVxuIiwidmFyIGxlZnRQYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpXG52YXIgZ2V0V2VlayA9IHJlcXVpcmUoJy4vZ2V0V2VlaycpXG5cbmZ1bmN0aW9uIGdldFVSTE9mVXNlcnMgKHdlZWtPZmZzZXQsIHR5cGUsIGlkKSB7XG4gIHJldHVybiBgLy8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0fS9tZWV0aW5ncG9pbnRQcm94eS9Sb29zdGVycy1BTCUyRmRvYyUyRmRhZ3Jvb3N0ZXJzJTJGYCArXG4gICAgICBgJHsoZ2V0V2VlaygpICsgd2Vla09mZnNldCl9JTJGJHt0eXBlfSUyRiR7dHlwZX0ke2xlZnRQYWQoaWQsIDUsICcwJyl9Lmh0bWBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRVUkxPZlVzZXJzXG4iLCIvLyBjb3BpZWQgZnJvbSBodHRwOi8vd3d3Lm1lZXRpbmdwb2ludG1jby5ubC9Sb29zdGVycy1BTC9kb2MvZGFncm9vc3RlcnMvdW50aXNzY3JpcHRzLmpzLFxuLy8gd2VyZSB1c2luZyB0aGUgc2FtZSBjb2RlIGFzIHRoZXkgZG8gdG8gYmUgc3VyZSB0aGF0IHdlIGFsd2F5cyBnZXQgdGhlIHNhbWVcbi8vIHdlZWsgbnVtYmVyLlxuZnVuY3Rpb24gZ2V0V2VlayAoKSB7XG4gIC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBkYXRlIG9iamVjdFxuICBjb25zdCB0YXJnZXQgPSBuZXcgRGF0ZSgpXG5cbiAgLy8gSVNPIHdlZWsgZGF0ZSB3ZWVrcyBzdGFydCBvbiBtb25kYXlcbiAgLy8gc28gY29ycmVjdCB0aGUgZGF5IG51bWJlclxuICBjb25zdCBkYXlOciA9ICh0YXJnZXQuZ2V0RGF5KCkgKyA2KSAlIDdcblxuICAvLyBJU08gODYwMSBzdGF0ZXMgdGhhdCB3ZWVrIDEgaXMgdGhlIHdlZWtcbiAgLy8gd2l0aCB0aGUgZmlyc3QgdGh1cnNkYXkgb2YgdGhhdCB5ZWFyLlxuICAvLyBTZXQgdGhlIHRhcmdldCBkYXRlIHRvIHRoZSB0aHVyc2RheSBpbiB0aGUgdGFyZ2V0IHdlZWtcbiAgdGFyZ2V0LnNldERhdGUodGFyZ2V0LmdldERhdGUoKSAtIGRheU5yICsgMylcblxuICAvLyBTdG9yZSB0aGUgbWlsbGlzZWNvbmQgdmFsdWUgb2YgdGhlIHRhcmdldCBkYXRlXG4gIGNvbnN0IGZpcnN0VGh1cnNkYXkgPSB0YXJnZXQudmFsdWVPZigpXG5cbiAgLy8gU2V0IHRoZSB0YXJnZXQgdG8gdGhlIGZpcnN0IHRodXJzZGF5IG9mIHRoZSB5ZWFyXG4gIC8vIEZpcnN0IHNldCB0aGUgdGFyZ2V0IHRvIGphbnVhcnkgZmlyc3RcbiAgdGFyZ2V0LnNldE1vbnRoKDAsIDEpXG4gIC8vIE5vdCBhIHRodXJzZGF5PyBDb3JyZWN0IHRoZSBkYXRlIHRvIHRoZSBuZXh0IHRodXJzZGF5XG4gIGlmICh0YXJnZXQuZ2V0RGF5KCkgIT09IDQpIHtcbiAgICB0YXJnZXQuc2V0TW9udGgoMCwgMSArICgoNCAtIHRhcmdldC5nZXREYXkoKSkgKyA3KSAlIDcpXG4gIH1cblxuICAvLyBUaGUgd2Vla251bWJlciBpcyB0aGUgbnVtYmVyIG9mIHdlZWtzIGJldHdlZW4gdGhlXG4gIC8vIGZpcnN0IHRodXJzZGF5IG9mIHRoZSB5ZWFyIGFuZCB0aGUgdGh1cnNkYXkgaW4gdGhlIHRhcmdldCB3ZWVrXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMCkgLy8gNjA0ODAwMDAwID0gNyAqIDI0ICogMzYwMCAqIDEwMDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRXZWVrXG4iLCIvKiBnbG9iYWwgZ2EgKi9cblxucmVxdWlyZSgnZmxleGliaWxpdHknKVxuXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5Jylcbi8vIGNvbnN0IGdldFVzZXJzID0gcmVxdWlyZSgnLi9nZXRVc2VycycpXG5jb25zdCBnZXRVUkxPZlVzZXIgPSByZXF1aXJlKCcuL2dldFVSTE9mVXNlcicpXG5jb25zdCByZW1vdmVEaWFjcml0aWNzID0gcmVxdWlyZSgnZGlhY3JpdGljcycpLnJlbW92ZVxuY29uc3QgZ2V0V2VlayA9IHJlcXVpcmUoJy4vZ2V0V2VlaycpXG5cbmNvbnN0IHNlYXJjaE5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VhcmNoJylcbmNvbnN0IGlucHV0Tm9kZSA9IHNlYXJjaE5vZGUucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInRleHRcIl0nKVxuY29uc3QgYXV0b2NvbXBsZXRlTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxuY29uc3Qgc2NoZWR1bGVJZnJhbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NoZWR1bGUnKVxuY29uc3QgcHJldkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJidXR0b25cIl0nKVswXVxuY29uc3QgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJidXR0b25cIl0nKVsxXVxuY29uc3QgY3VycmVudFdlZWtOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1cnJlbnQnKVxuY29uc3QgZmF2Tm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXYnKVxuXG5pZiAod2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoJz8nKVsxXSAhPT0gJ25mZCcpIHsgLy8gbmZkID0gbm8gZmVhdHVyZSBkZXRlY3Rpb25cbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpLmdldENsaWVudFJlY3RzKClbMF0uYm90dG9tICE9PSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbiA9ICdodHRwOi8vd3d3Lm1lZXRpbmdwb2ludG1jby5ubC9Sb29zdGVycy1BTC9kb2MvJ1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uID0gJ2h0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy8nXG4gICAgfVxuICB9XG59XG5cbmxldCBzZWxlY3RlZFJlc3VsdCA9IC0xXG5sZXQgc2VsZWN0ZWRVc2VyXG5sZXQgcmVzdWx0cyA9IFtdXG5sZXQgb2Zmc2V0ID0gMFxuXG5mdW5jdGlvbiBnZXRVc2VycyAoKSB7XG4gIGNvbnN0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RhdGEnKVxuICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuZGF0YS11c2VyJylcbiAgY29uc3QgZWxlbWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlcylcbiAgY29uc3QgdXNlcnMgPSBlbGVtZW50cy5tYXAodXNlck5vZGUgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSB1c2VyTm9kZS5xdWVyeVNlbGVjdG9yKCcuZGF0YS10eXBlJykudGV4dENvbnRlbnRcbiAgICBjb25zdCB2YWx1ZSA9IHVzZXJOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5kYXRhLXZhbHVlJykudGV4dENvbnRlbnRcbiAgICBjb25zdCBpbmRleCA9IE51bWJlcih1c2VyTm9kZS5xdWVyeVNlbGVjdG9yKCcuZGF0YS1pbmRleCcpLnRleHRDb250ZW50KVxuICAgIHJldHVybiB7IHR5cGUsIHZhbHVlLCBpbmRleCB9XG4gIH0pXG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RhdGEnKS5vdXRlckhUTUwgPSAnJ1xuXG4gIHJldHVybiB1c2Vyc1xufVxuXG5jb25zdCB1c2VycyA9IGdldFVzZXJzKClcblxuZnVuY3Rpb24gZ2V0Q3VycmVudEZhdiAoKSB7XG4gIGlmICghd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSkgcmV0dXJuXG4gIGNvbnN0IGZhdkNvZGUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpLnNwbGl0KCc6JylcbiAgY29uc3QgZmF2ID0gdXNlcnMuZmlsdGVyKHVzZXIgPT4gdXNlci50eXBlID09PSBmYXZDb2RlWzBdICYmIHVzZXIuaW5kZXggPT09IE51bWJlcihmYXZDb2RlWzFdKSlcbiAgcmV0dXJuIGZhdlswXVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VGYXYgKGlzRmF2KSB7XG4gIGlmICghc2VsZWN0ZWRVc2VyKSByZXR1cm5cbiAgaWYgKGlzRmF2KSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmYXYnLCBzZWxlY3RlZFVzZXIudHlwZSArICc6JyArIHNlbGVjdGVkVXNlci5pbmRleClcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG4gIH1cbiAgdXBkYXRlRmF2Tm9kZSgpXG59XG5cbmZ1bmN0aW9uIHVzZXJzRXF1YWwgKHVzZXIxLCB1c2VyMikge1xuICBpZiAodXNlcjEgPT0gbnVsbCB8fCB1c2VyMiA9PSBudWxsKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHVzZXIxLnR5cGUgPT09IHVzZXIyLnR5cGUgJiYgdXNlcjEuaW5kZXggPT09IHVzZXIyLmluZGV4XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUZhdk5vZGUgKCkge1xuICBpZiAodXNlcnNFcXVhbChnZXRDdXJyZW50RmF2KCksIHNlbGVjdGVkVXNlcikpIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODM4OydcbiAgfSBlbHNlIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdlZWtUZXh0ICgpIHtcbiAgaWYgKG9mZnNldCA9PT0gMCkgY3VycmVudFdlZWtOb2RlLmlubmVySFRNTCA9IGBXZWVrICR7Z2V0V2VlaygpICsgb2Zmc2V0fWBcbiAgZWxzZSBjdXJyZW50V2Vla05vZGUuaW5uZXJIVE1MID0gYDxzdHJvbmc+V2VlayAke2dldFdlZWsoKSArIG9mZnNldH08L3N0cm9uZz5gXG59XG5cbnVwZGF0ZVdlZWtUZXh0KClcblxuc2VhcmNoTm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgaWYgKChyZXN1bHRzLmxlbmd0aCAhPT0gMCkgJiYgKGUua2V5ID09PSAnQXJyb3dEb3duJyB8fCBlLmtleSA9PT0gJ0Fycm93VXAnKSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3RlZCcpKSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0ZWQnKS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG5cbiAgICBjb25zdCBjaGFuZ2UgPSBlLmtleSA9PT0gJ0Fycm93RG93bicgPyAxIDogLTFcbiAgICBzZWxlY3RlZFJlc3VsdCArPSBjaGFuZ2VcbiAgICBpZiAoc2VsZWN0ZWRSZXN1bHQgPCAtMSkgc2VsZWN0ZWRSZXN1bHQgPSByZXN1bHRzLmxlbmd0aCAtIDFcbiAgICBlbHNlIGlmIChzZWxlY3RlZFJlc3VsdCA+IHJlc3VsdHMubGVuZ3RoIC0gMSkgc2VsZWN0ZWRSZXN1bHQgPSAtMVxuXG4gICAgaWYgKHNlbGVjdGVkUmVzdWx0ICE9PSAtMSkgYXV0b2NvbXBsZXRlTm9kZS5jaGlsZHJlbltzZWxlY3RlZFJlc3VsdF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgYXV0b2NvbXBsZXRlTm9kZS5pbm5lckhUTUwgPSAnJ1xuICBpZiAoaW5wdXROb2RlLnZhbHVlLnRyaW0oKSA9PT0gJycpIHJldHVyblxuXG4gIHNlbGVjdGVkUmVzdWx0ID0gLTFcbiAgcmVzdWx0cyA9IGZ1enp5LmZpbHRlcihyZW1vdmVEaWFjcml0aWNzKGlucHV0Tm9kZS52YWx1ZSksIHVzZXJzLCB7XG4gICAgZXh0cmFjdDogZnVuY3Rpb24gKGVsKSB7IHJldHVybiByZW1vdmVEaWFjcml0aWNzKGVsLnZhbHVlKSB9XG4gIH0pLnNsaWNlKDAsIDcpXG5cbiAgcmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICBjb25zdCByZXN1bHROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgIHJlc3VsdE5vZGUuaW5uZXJIVE1MID0gYCR7cmVzdWx0Lm9yaWdpbmFsLnZhbHVlfWBcbiAgICBhdXRvY29tcGxldGVOb2RlLmFwcGVuZENoaWxkKHJlc3VsdE5vZGUpXG4gIH0pXG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHN1Ym1pdEZvcm0pXG5cbmZ1bmN0aW9uIHN1Ym1pdEZvcm0gKGUpIHtcbiAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuICBpZiAocmVzdWx0cy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCBpbmRleEluUmVzdWx0ID0gc2VsZWN0ZWRSZXN1bHQgPT09IC0xID8gMCA6IHNlbGVjdGVkUmVzdWx0XG4gICAgc2VsZWN0ZWRVc2VyID0gdXNlcnNbcmVzdWx0c1tpbmRleEluUmVzdWx0XS5pbmRleF1cbiAgfVxuICBpZiAoc2VsZWN0ZWRVc2VyID09IG51bGwpIHJldHVyblxuXG4gIHVwZGF0ZUZhdk5vZGUoKVxuXG4gIGlucHV0Tm9kZS52YWx1ZSA9IHNlbGVjdGVkVXNlci52YWx1ZVxuICBhdXRvY29tcGxldGVOb2RlLmlubmVySFRNTCA9ICcnXG5cbiAgaW5wdXROb2RlLmJsdXIoKVxuXG4gIHNjaGVkdWxlSWZyYW1lLnNyYyA9IGdldFVSTE9mVXNlcihvZmZzZXQsIHNlbGVjdGVkVXNlci50eXBlLCBzZWxlY3RlZFVzZXIuaW5kZXggKyAxKVxuXG4gIGxldCBldmVudEFjdGlvblxuICBzd2l0Y2ggKHNlbGVjdGVkVXNlci50eXBlKSB7XG4gICAgY2FzZSAnYyc6XG4gICAgICBldmVudEFjdGlvbiA9ICdDbGFzcydcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndCc6XG4gICAgICBldmVudEFjdGlvbiA9ICdUZWFjaGVyJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdyJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1Jvb20nXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnU3R1ZGVudCdcbiAgICAgIGJyZWFrXG4gIH1cbiAgY29uc3QgZXZlbnRMYWJlbCA9IHNlbGVjdGVkVXNlci52YWx1ZVxuXG4gIGdhKGZ1bmN0aW9uICgpIHtcbiAgICBnYSgnc2VuZCcsIHsgaGl0VHlwZTogJ2V2ZW50JywgZXZlbnRDYXRlZ29yeTogJ3NlYXJjaCcsIGV2ZW50QWN0aW9uLCBldmVudExhYmVsIH0pXG4gIH0pXG59XG5cbmF1dG9jb21wbGV0ZU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICBpZiAoYXV0b2NvbXBsZXRlTm9kZS5jb250YWlucyhlLnRhcmdldCkpIHtcbiAgICBzZWxlY3RlZFJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoZS50YXJnZXQucGFyZW50RWxlbWVudC5jaGlsZE5vZGVzLCBlLnRhcmdldClcbiAgICBzdWJtaXRGb3JtKClcbiAgfVxufSlcblxucHJldkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgb2Zmc2V0LS1cbiAgdXBkYXRlV2Vla1RleHQoKVxuICBzdWJtaXRGb3JtKClcbn0pXG5cbm5leHRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIG9mZnNldCsrXG4gIHVwZGF0ZVdlZWtUZXh0KClcbiAgc3VibWl0Rm9ybSgpXG59KVxuXG5pbnB1dE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGlucHV0Tm9kZS5zZWxlY3QoKVxufSlcblxuaW5wdXROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuICBpZiAoIWlzU2FmYXJpKSB7XG4gICAgaW5wdXROb2RlLnNlbGVjdGlvblN0YXJ0ID0gaW5wdXROb2RlLnNlbGVjdGlvbkVuZCA9IC0xXG4gIH1cbn0pXG5cbnNlYXJjaE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uIChlKSB7XG4gIGF1dG9jb21wbGV0ZU5vZGUuaW5uZXJIVE1MID0gJydcbn0pXG5cbmZhdk5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGlmICh1c2Vyc0VxdWFsKGdldEN1cnJlbnRGYXYoKSwgc2VsZWN0ZWRVc2VyKSkge1xuICAgIGNoYW5nZUZhdihmYWxzZSlcbiAgfSBlbHNlIHtcbiAgICBjaGFuZ2VGYXYodHJ1ZSlcbiAgfVxufSlcblxuY29uc3QgY3VycmVudEZhdiA9IGdldEN1cnJlbnRGYXYoKVxuXG5pZiAoY3VycmVudEZhdikge1xuICBzZWxlY3RlZFVzZXIgPSBjdXJyZW50RmF2XG4gIGlucHV0Tm9kZS52YWx1ZSA9IHNlbGVjdGVkVXNlci52YWx1ZVxuICBzY2hlZHVsZUlmcmFtZS5zcmMgPSBnZXRVUkxPZlVzZXIob2Zmc2V0LCBzZWxlY3RlZFVzZXIudHlwZSwgc2VsZWN0ZWRVc2VyLmluZGV4ICsgMSlcbiAgdXBkYXRlRmF2Tm9kZSgpXG59XG4iXX0=
