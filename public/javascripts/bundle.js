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

var selectedResult = -1;
var selectedUser = void 0;
var results = void 0;
var offset = 0;

function getUsers() {
  var nodes = document.querySelector('#data').querySelectorAll('.data-user');
  var elements = Array.prototype.slice.call(nodes);
  var users = elements.map(function (userNode) {
    var type = userNode.querySelector('.data-type').textContent;
    var value = userNode.querySelector('.data-value').textContent;
    var index = Number(userNode.querySelector('.data-index').textContent);
    var other = userNode.querySelector('.data-other').textContent;
    var isID = userNode.querySelector('.data-isID').textContent === 'true';
    return { type: type, value: value, index: index, other: other, isID: isID };
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
  return fav[fav.length - 1];
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
  if (results && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
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

  if (inputNode.value === 'From The Depths') {
    results.push({ original: { value: 'Laat dit niet aan sam zien 😉.', other: '' } });
  } else if (/^(?:meneer|mevrouw) \w+ docent$/i.test(inputNode.value)) {
    results.push({ original: { value: 'CAVIA!', other: '', type: 's', index: 173 } });
  }

  console.log(results[0]);

  results.forEach(function (result) {
    var resultNode = document.createElement('li');
    resultNode.innerHTML = result.original.value + '<span class="other">' + result.original.other + '</span>';
    autocompleteNode.appendChild(resultNode);
  });
});

searchNode.addEventListener('submit', submitForm);

function submitForm(e) {
  if (e) e.preventDefault();
  if (results != null) {
    var indexInResult = selectedResult === -1 ? 0 : selectedResult;
    selectedUser = users[results[indexInResult].index];
  }
  if (selectedUser == null) return;

  updateFavNode();

  inputNode.value = selectedUser.value;
  autocompleteNode.innerHTML = '';

  inputNode.blur();

  scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);

  var hitType = 'event';
  var eventCategory = void 0;
  switch (selectedUser.type) {
    case 'c':
      eventCategory = 'Class';
      break;
    case 't':
      eventCategory = 'Teacher';
      break;
    case 'r':
      eventCategory = 'Room';
      break;
    case 's':
      eventCategory = 'Student';
      break;
  }
  var eventAction = void 0;
  if (selectedUser.isID) {
    eventAction = 'by id';
  } else {
    eventAction = 'by name';
  }
  var eventLabel = selectedUser.value;

  ga(function () {
    ga('send', { hitType: hitType, eventCategory: eventCategory, eventAction: eventAction, eventLabel: eventLabel });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGlhY3JpdGljcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGV4aWJpbGl0eS9mbGV4aWJpbGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZ2V0VVJMT2ZVc2VyLmpzIiwicHVibGljL2phdmFzY3JpcHRzL2dldFdlZWsuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pUQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Z0JBQVIsQ0FBeUIsT0FBekIsRUFBa0MsWUFBWTtBQUM1QyxNQUFJLFdBQVcsZUFBWCxFQUE0QixZQUE1QixDQUFKLEVBQStDO0FBQzdDLGNBQVUsS0FBVjtBQUNELEdBRkQsTUFFTztBQUNMLGNBQVUsSUFBVjtBQUNEO0FBQ0YsQ0FORDs7QUFRQSxJQUFNLGFBQWEsZUFBbkI7O0FBRUEsSUFBSSxVQUFKLEVBQWdCO0FBQ2QsaUJBQWUsVUFBZjtBQUNBLFlBQVUsS0FBVixHQUFrQixhQUFhLEtBQS9CO0FBQ0EsaUJBQWUsR0FBZixHQUFxQixhQUFhLE1BQWIsRUFBcUIsYUFBYSxJQUFsQyxFQUF3QyxhQUFhLEtBQWIsR0FBcUIsQ0FBN0QsQ0FBckI7QUFDQTtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydHMucmVtb3ZlID0gcmVtb3ZlRGlhY3JpdGljcztcblxudmFyIHJlcGxhY2VtZW50TGlzdCA9IFtcbiAge1xuICAgIGJhc2U6ICcgJyxcbiAgICBjaGFyczogXCJcXHUwMEEwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnMCcsXG4gICAgY2hhcnM6IFwiXFx1MDdDMFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0EnLFxuICAgIGNoYXJzOiBcIlxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2RlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FBJyxcbiAgICBjaGFyczogXCJcXHVBNzMyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQUUnLFxuICAgIGNoYXJzOiBcIlxcdTAwQzZcXHUwMUZDXFx1MDFFMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FPJyxcbiAgICBjaGFyczogXCJcXHVBNzM0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQVUnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzZcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBVicsXG4gICAgY2hhcnM6IFwiXFx1QTczOFxcdUE3M0FcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBWScsXG4gICAgY2hhcnM6IFwiXFx1QTczQ1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ0InLFxuICAgIGNoYXJzOiBcIlxcdTI0QjdcXHVGRjIyXFx1MUUwMlxcdTFFMDRcXHUxRTA2XFx1MDI0M1xcdTAxODFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdDJyxcbiAgICBjaGFyczogXCJcXHUyNGI4XFx1ZmYyM1xcdUE3M0VcXHUxRTA4XFx1MDEwNlxcdTAwNDNcXHUwMTA4XFx1MDEwQVxcdTAxMENcXHUwMEM3XFx1MDE4N1xcdTAyM0JcIixcbiAgfSwge1xuICAgIGJhc2U6ICdEJyxcbiAgICBjaGFyczogXCJcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThBXFx1MDE4OVxcdTFEMDVcXHVBNzc5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRGgnLFxuICAgIGNoYXJzOiBcIlxcdTAwRDBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdEWicsXG4gICAgY2hhcnM6IFwiXFx1MDFGMVxcdTAxQzRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdEeicsXG4gICAgY2hhcnM6IFwiXFx1MDFGMlxcdTAxQzVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdFJyxcbiAgICBjaGFyczogXCJcXHUwMjVCXFx1MjRCQVxcdUZGMjVcXHUwMEM4XFx1MDBDOVxcdTAwQ0FcXHUxRUMwXFx1MUVCRVxcdTFFQzRcXHUxRUMyXFx1MUVCQ1xcdTAxMTJcXHUxRTE0XFx1MUUxNlxcdTAxMTRcXHUwMTE2XFx1MDBDQlxcdTFFQkFcXHUwMTFBXFx1MDIwNFxcdTAyMDZcXHUxRUI4XFx1MUVDNlxcdTAyMjhcXHUxRTFDXFx1MDExOFxcdTFFMThcXHUxRTFBXFx1MDE5MFxcdTAxOEVcXHUxRDA3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRicsXG4gICAgY2hhcnM6IFwiXFx1QTc3Q1xcdTI0QkJcXHVGRjI2XFx1MUUxRVxcdTAxOTFcXHVBNzdCXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnRycsXG4gICAgY2hhcnM6IFwiXFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VcXHUwMjYyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnSCcsXG4gICAgY2hhcnM6IFwiXFx1MjRCRFxcdUZGMjhcXHUwMTI0XFx1MUUyMlxcdTFFMjZcXHUwMjFFXFx1MUUyNFxcdTFFMjhcXHUxRTJBXFx1MDEyNlxcdTJDNjdcXHUyQzc1XFx1QTc4RFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0knLFxuICAgIGNoYXJzOiBcIlxcdTI0QkVcXHVGRjI5XFx4Q0NcXHhDRFxceENFXFx1MDEyOFxcdTAxMkFcXHUwMTJDXFx1MDEzMFxceENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnSicsXG4gICAgY2hhcnM6IFwiXFx1MjRCRlxcdUZGMkFcXHUwMTM0XFx1MDI0OFxcdTAyMzdcIixcbiAgfSwge1xuICAgIGJhc2U6ICdLJyxcbiAgICBjaGFyczogXCJcXHUyNEMwXFx1RkYyQlxcdTFFMzBcXHUwMUU4XFx1MUUzMlxcdTAxMzZcXHUxRTM0XFx1MDE5OFxcdTJDNjlcXHVBNzQwXFx1QTc0MlxcdUE3NDRcXHVBN0EyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTCcsXG4gICAgY2hhcnM6IFwiXFx1MjRDMVxcdUZGMkNcXHUwMTNGXFx1MDEzOVxcdTAxM0RcXHUxRTM2XFx1MUUzOFxcdTAxM0JcXHUxRTNDXFx1MUUzQVxcdTAxNDFcXHUwMjNEXFx1MkM2MlxcdTJDNjBcXHVBNzQ4XFx1QTc0NlxcdUE3ODBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdMSicsXG4gICAgY2hhcnM6IFwiXFx1MDFDN1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ0xqJyxcbiAgICBjaGFyczogXCJcXHUwMUM4XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTScsXG4gICAgY2hhcnM6IFwiXFx1MjRDMlxcdUZGMkRcXHUxRTNFXFx1MUU0MFxcdTFFNDJcXHUyQzZFXFx1MDE5Q1xcdTAzRkJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdOJyxcbiAgICBjaGFyczogXCJcXHVBN0E0XFx1MDIyMFxcdTI0QzNcXHVGRjJFXFx1MDFGOFxcdTAxNDNcXHhEMVxcdTFFNDRcXHUwMTQ3XFx1MUU0NlxcdTAxNDVcXHUxRTRBXFx1MUU0OFxcdTAxOURcXHVBNzkwXFx1MUQwRVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ05KJyxcbiAgICBjaGFyczogXCJcXHUwMUNBXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTmonLFxuICAgIGNoYXJzOiBcIlxcdTAxQ0JcIixcbiAgfSwge1xuICAgIGJhc2U6ICdPJyxcbiAgICBjaGFyczogXCJcXHUyNEM0XFx1RkYyRlxceEQyXFx4RDNcXHhENFxcdTFFRDJcXHUxRUQwXFx1MUVENlxcdTFFRDRcXHhENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxceEQ2XFx1MDIyQVxcdTFFQ0VcXHUwMTUwXFx1MDFEMVxcdTAyMENcXHUwMjBFXFx1MDFBMFxcdTFFRENcXHUxRURBXFx1MUVFMFxcdTFFREVcXHUxRUUyXFx1MUVDQ1xcdTFFRDhcXHUwMUVBXFx1MDFFQ1xceEQ4XFx1MDFGRVxcdTAxODZcXHUwMTlGXFx1QTc0QVxcdUE3NENcIixcbiAgfSwge1xuICAgIGJhc2U6ICdPRScsXG4gICAgY2hhcnM6IFwiXFx1MDE1MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ09JJyxcbiAgICBjaGFyczogXCJcXHUwMUEyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnT08nLFxuICAgIGNoYXJzOiBcIlxcdUE3NEVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdPVScsXG4gICAgY2hhcnM6IFwiXFx1MDIyMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1AnLFxuICAgIGNoYXJzOiBcIlxcdTI0QzVcXHVGRjMwXFx1MUU1NFxcdTFFNTZcXHUwMUE0XFx1MkM2M1xcdUE3NTBcXHVBNzUyXFx1QTc1NFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1EnLFxuICAgIGNoYXJzOiBcIlxcdTI0QzZcXHVGRjMxXFx1QTc1NlxcdUE3NThcXHUwMjRBXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnUicsXG4gICAgY2hhcnM6IFwiXFx1MjRDN1xcdUZGMzJcXHUwMTU0XFx1MUU1OFxcdTAxNThcXHUwMjEwXFx1MDIxMlxcdTFFNUFcXHUxRTVDXFx1MDE1NlxcdTFFNUVcXHUwMjRDXFx1MkM2NFxcdUE3NUFcXHVBN0E2XFx1QTc4MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1MnLFxuICAgIGNoYXJzOiBcIlxcdTI0QzhcXHVGRjMzXFx1MUU5RVxcdTAxNUFcXHUxRTY0XFx1MDE1Q1xcdTFFNjBcXHUwMTYwXFx1MUU2NlxcdTFFNjJcXHUxRTY4XFx1MDIxOFxcdTAxNUVcXHUyQzdFXFx1QTdBOFxcdUE3ODRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdUJyxcbiAgICBjaGFyczogXCJcXHUyNEM5XFx1RkYzNFxcdTFFNkFcXHUwMTY0XFx1MUU2Q1xcdTAyMUFcXHUwMTYyXFx1MUU3MFxcdTFFNkVcXHUwMTY2XFx1MDFBQ1xcdTAxQUVcXHUwMjNFXFx1QTc4NlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1RoJyxcbiAgICBjaGFyczogXCJcXHUwMERFXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVFonLFxuICAgIGNoYXJzOiBcIlxcdUE3MjhcIixcbiAgfSwge1xuICAgIGJhc2U6ICdVJyxcbiAgICBjaGFyczogXCJcXHUyNENBXFx1RkYzNVxceEQ5XFx4REFcXHhEQlxcdTAxNjhcXHUxRTc4XFx1MDE2QVxcdTFFN0FcXHUwMTZDXFx4RENcXHUwMURCXFx1MDFEN1xcdTAxRDVcXHUwMUQ5XFx1MUVFNlxcdTAxNkVcXHUwMTcwXFx1MDFEM1xcdTAyMTRcXHUwMjE2XFx1MDFBRlxcdTFFRUFcXHUxRUU4XFx1MUVFRVxcdTFFRUNcXHUxRUYwXFx1MUVFNFxcdTFFNzJcXHUwMTcyXFx1MUU3NlxcdTFFNzRcXHUwMjQ0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVicsXG4gICAgY2hhcnM6IFwiXFx1MjRDQlxcdUZGMzZcXHUxRTdDXFx1MUU3RVxcdTAxQjJcXHVBNzVFXFx1MDI0NVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1ZZJyxcbiAgICBjaGFyczogXCJcXHVBNzYwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVycsXG4gICAgY2hhcnM6IFwiXFx1MjRDQ1xcdUZGMzdcXHUxRTgwXFx1MUU4MlxcdTAxNzRcXHUxRTg2XFx1MUU4NFxcdTFFODhcXHUyQzcyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnWCcsXG4gICAgY2hhcnM6IFwiXFx1MjRDRFxcdUZGMzhcXHUxRThBXFx1MUU4Q1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ1knLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0VcXHVGRjM5XFx1MUVGMlxceEREXFx1MDE3NlxcdTFFRjhcXHUwMjMyXFx1MUU4RVxcdTAxNzhcXHUxRUY2XFx1MUVGNFxcdTAxQjNcXHUwMjRFXFx1MUVGRVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1onLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0ZcXHVGRjNBXFx1MDE3OVxcdTFFOTBcXHUwMTdCXFx1MDE3RFxcdTFFOTJcXHUxRTk0XFx1MDFCNVxcdTAyMjRcXHUyQzdGXFx1MkM2QlxcdUE3NjJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhJyxcbiAgICBjaGFyczogXCJcXHUyNEQwXFx1RkY0MVxcdTFFOUFcXHUwMEUwXFx1MDBFMVxcdTAwRTJcXHUxRUE3XFx1MUVBNVxcdTFFQUJcXHUxRUE5XFx1MDBFM1xcdTAxMDFcXHUwMTAzXFx1MUVCMVxcdTFFQUZcXHUxRUI1XFx1MUVCM1xcdTAyMjdcXHUwMUUxXFx1MDBFNFxcdTAxREZcXHUxRUEzXFx1MDBFNVxcdTAxRkJcXHUwMUNFXFx1MDIwMVxcdTAyMDNcXHUxRUExXFx1MUVBRFxcdTFFQjdcXHUxRTAxXFx1MDEwNVxcdTJDNjVcXHUwMjUwXFx1MDI1MVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2FhJyxcbiAgICBjaGFyczogXCJcXHVBNzMzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYWUnLFxuICAgIGNoYXJzOiBcIlxcdTAwRTZcXHUwMUZEXFx1MDFFM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ2FvJyxcbiAgICBjaGFyczogXCJcXHVBNzM1XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYXUnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzdcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhdicsXG4gICAgY2hhcnM6IFwiXFx1QTczOVxcdUE3M0JcIixcbiAgfSwge1xuICAgIGJhc2U6ICdheScsXG4gICAgY2hhcnM6IFwiXFx1QTczRFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2InLFxuICAgIGNoYXJzOiBcIlxcdTI0RDFcXHVGRjQyXFx1MUUwM1xcdTFFMDVcXHUxRTA3XFx1MDE4MFxcdTAxODNcXHUwMjUzXFx1MDE4MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2MnLFxuICAgIGNoYXJzOiBcIlxcdUZGNDNcXHUyNEQyXFx1MDEwN1xcdTAxMDlcXHUwMTBCXFx1MDEwRFxcdTAwRTdcXHUxRTA5XFx1MDE4OFxcdTAyM0NcXHVBNzNGXFx1MjE4NFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2QnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDNcXHVGRjQ0XFx1MUUwQlxcdTAxMEZcXHUxRTBEXFx1MUUxMVxcdTFFMTNcXHUxRTBGXFx1MDExMVxcdTAxOENcXHUwMjU2XFx1MDI1N1xcdTAxOEJcXHUxM0U3XFx1MDUwMVxcdUE3QUFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdkaCcsXG4gICAgY2hhcnM6IFwiXFx1MDBGMFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2R6JyxcbiAgICBjaGFyczogXCJcXHUwMUYzXFx1MDFDNlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2UnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDRcXHVGRjQ1XFx1MDBFOFxcdTAwRTlcXHUwMEVBXFx1MUVDMVxcdTFFQkZcXHUxRUM1XFx1MUVDM1xcdTFFQkRcXHUwMTEzXFx1MUUxNVxcdTFFMTdcXHUwMTE1XFx1MDExN1xcdTAwRUJcXHUxRUJCXFx1MDExQlxcdTAyMDVcXHUwMjA3XFx1MUVCOVxcdTFFQzdcXHUwMjI5XFx1MUUxRFxcdTAxMTlcXHUxRTE5XFx1MUUxQlxcdTAyNDdcXHUwMUREXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZicsXG4gICAgY2hhcnM6IFwiXFx1MjRENVxcdUZGNDZcXHUxRTFGXFx1MDE5MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2ZmJyxcbiAgICBjaGFyczogXCJcXHVGQjAwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZmknLFxuICAgIGNoYXJzOiBcIlxcdUZCMDFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmbCcsXG4gICAgY2hhcnM6IFwiXFx1RkIwMlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2ZmaScsXG4gICAgY2hhcnM6IFwiXFx1RkIwM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ2ZmbCcsXG4gICAgY2hhcnM6IFwiXFx1RkIwNFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2cnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDZcXHVGRjQ3XFx1MDFGNVxcdTAxMURcXHUxRTIxXFx1MDExRlxcdTAxMjFcXHUwMUU3XFx1MDEyM1xcdTAxRTVcXHUwMjYwXFx1QTdBMVxcdUE3N0ZcXHUxRDc5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnaCcsXG4gICAgY2hhcnM6IFwiXFx1MjREN1xcdUZGNDhcXHUwMTI1XFx1MUUyM1xcdTFFMjdcXHUwMjFGXFx1MUUyNVxcdTFFMjlcXHUxRTJCXFx1MUU5NlxcdTAxMjdcXHUyQzY4XFx1MkM3NlxcdTAyNjVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdodicsXG4gICAgY2hhcnM6IFwiXFx1MDE5NVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2knLFxuICAgIGNoYXJzOiBcIlxcdTI0RDhcXHVGRjQ5XFx4RUNcXHhFRFxceEVFXFx1MDEyOVxcdTAxMkJcXHUwMTJEXFx4RUZcXHUxRTJGXFx1MUVDOVxcdTAxRDBcXHUwMjA5XFx1MDIwQlxcdTFFQ0JcXHUwMTJGXFx1MUUyRFxcdTAyNjhcXHUwMTMxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnaicsXG4gICAgY2hhcnM6IFwiXFx1MjREOVxcdUZGNEFcXHUwMTM1XFx1MDFGMFxcdTAyNDlcIixcbiAgfSwge1xuICAgIGJhc2U6ICdrJyxcbiAgICBjaGFyczogXCJcXHUyNERBXFx1RkY0QlxcdTFFMzFcXHUwMUU5XFx1MUUzM1xcdTAxMzdcXHUxRTM1XFx1MDE5OVxcdTJDNkFcXHVBNzQxXFx1QTc0M1xcdUE3NDVcXHVBN0EzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbCcsXG4gICAgY2hhcnM6IFwiXFx1MjREQlxcdUZGNENcXHUwMTQwXFx1MDEzQVxcdTAxM0VcXHUxRTM3XFx1MUUzOVxcdTAxM0NcXHUxRTNEXFx1MUUzQlxcdTAxN0ZcXHUwMTQyXFx1MDE5QVxcdTAyNkJcXHUyQzYxXFx1QTc0OVxcdUE3ODFcXHVBNzQ3XFx1MDI2RFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2xqJyxcbiAgICBjaGFyczogXCJcXHUwMUM5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbScsXG4gICAgY2hhcnM6IFwiXFx1MjREQ1xcdUZGNERcXHUxRTNGXFx1MUU0MVxcdTFFNDNcXHUwMjcxXFx1MDI2RlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ24nLFxuICAgIGNoYXJzOiBcIlxcdTI0RERcXHVGRjRFXFx1MDFGOVxcdTAxNDRcXHhGMVxcdTFFNDVcXHUwMTQ4XFx1MUU0N1xcdTAxNDZcXHUxRTRCXFx1MUU0OVxcdTAxOUVcXHUwMjcyXFx1MDE0OVxcdUE3OTFcXHVBN0E1XFx1MDQzQlxcdTA1MDlcIixcbiAgfSwge1xuICAgIGJhc2U6ICduaicsXG4gICAgY2hhcnM6IFwiXFx1MDFDQ1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ28nLFxuICAgIGNoYXJzOiBcIlxcdTI0REVcXHVGRjRGXFx4RjJcXHhGM1xceEY0XFx1MUVEM1xcdTFFRDFcXHUxRUQ3XFx1MUVENVxceEY1XFx1MUU0RFxcdTAyMkRcXHUxRTRGXFx1MDE0RFxcdTFFNTFcXHUxRTUzXFx1MDE0RlxcdTAyMkZcXHUwMjMxXFx4RjZcXHUwMjJCXFx1MUVDRlxcdTAxNTFcXHUwMUQyXFx1MDIwRFxcdTAyMEZcXHUwMUExXFx1MUVERFxcdTFFREJcXHUxRUUxXFx1MUVERlxcdTFFRTNcXHUxRUNEXFx1MUVEOVxcdTAxRUJcXHUwMUVEXFx4RjhcXHUwMUZGXFx1QTc0QlxcdUE3NERcXHUwMjc1XFx1MDI1NFxcdTFEMTFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdvZScsXG4gICAgY2hhcnM6IFwiXFx1MDE1M1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ29pJyxcbiAgICBjaGFyczogXCJcXHUwMUEzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnb28nLFxuICAgIGNoYXJzOiBcIlxcdUE3NEZcIixcbiAgfSwge1xuICAgIGJhc2U6ICdvdScsXG4gICAgY2hhcnM6IFwiXFx1MDIyM1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ3AnLFxuICAgIGNoYXJzOiBcIlxcdTI0REZcXHVGRjUwXFx1MUU1NVxcdTFFNTdcXHUwMUE1XFx1MUQ3RFxcdUE3NTFcXHVBNzUzXFx1QTc1NVxcdTAzQzFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdxJyxcbiAgICBjaGFyczogXCJcXHUyNEUwXFx1RkY1MVxcdTAyNEJcXHVBNzU3XFx1QTc1OVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3InLFxuICAgIGNoYXJzOiBcIlxcdTI0RTFcXHVGRjUyXFx1MDE1NVxcdTFFNTlcXHUwMTU5XFx1MDIxMVxcdTAyMTNcXHUxRTVCXFx1MUU1RFxcdTAxNTdcXHUxRTVGXFx1MDI0RFxcdTAyN0RcXHVBNzVCXFx1QTdBN1xcdUE3ODNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdzJyxcbiAgICBjaGFyczogXCJcXHUyNEUyXFx1RkY1M1xcdTAxNUJcXHUxRTY1XFx1MDE1RFxcdTFFNjFcXHUwMTYxXFx1MUU2N1xcdTFFNjNcXHUxRTY5XFx1MDIxOVxcdTAxNUZcXHUwMjNGXFx1QTdBOVxcdUE3ODVcXHUxRTlCXFx1MDI4MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3NzJyxcbiAgICBjaGFyczogXCJcXHhERlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3QnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTNcXHVGRjU0XFx1MUU2QlxcdTFFOTdcXHUwMTY1XFx1MUU2RFxcdTAyMUJcXHUwMTYzXFx1MUU3MVxcdTFFNkZcXHUwMTY3XFx1MDFBRFxcdTAyODhcXHUyQzY2XFx1QTc4N1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ3RoJyxcbiAgICBjaGFyczogXCJcXHUwMEZFXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndHonLFxuICAgIGNoYXJzOiBcIlxcdUE3MjlcIixcbiAgfSwge1xuICAgIGJhc2U6ICd1JyxcbiAgICBjaGFyczogXCJcXHUyNEU0XFx1RkY1NVxceEY5XFx4RkFcXHhGQlxcdTAxNjlcXHUxRTc5XFx1MDE2QlxcdTFFN0JcXHUwMTZEXFx4RkNcXHUwMURDXFx1MDFEOFxcdTAxRDZcXHUwMURBXFx1MUVFN1xcdTAxNkZcXHUwMTcxXFx1MDFENFxcdTAyMTVcXHUwMjE3XFx1MDFCMFxcdTFFRUJcXHUxRUU5XFx1MUVFRlxcdTFFRURcXHUxRUYxXFx1MUVFNVxcdTFFNzNcXHUwMTczXFx1MUU3N1xcdTFFNzVcXHUwMjg5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndicsXG4gICAgY2hhcnM6IFwiXFx1MjRFNVxcdUZGNTZcXHUxRTdEXFx1MUU3RlxcdTAyOEJcXHVBNzVGXFx1MDI4Q1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ3Z5JyxcbiAgICBjaGFyczogXCJcXHVBNzYxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndycsXG4gICAgY2hhcnM6IFwiXFx1MjRFNlxcdUZGNTdcXHUxRTgxXFx1MUU4M1xcdTAxNzVcXHUxRTg3XFx1MUU4NVxcdTFFOThcXHUxRTg5XFx1MkM3M1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ3gnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTdcXHVGRjU4XFx1MUU4QlxcdTFFOERcIixcbiAgfSwge1xuICAgIGJhc2U6ICd5JyxcbiAgICBjaGFyczogXCJcXHUyNEU4XFx1RkY1OVxcdTFFRjNcXHhGRFxcdTAxNzdcXHUxRUY5XFx1MDIzM1xcdTFFOEZcXHhGRlxcdTFFRjdcXHUxRTk5XFx1MUVGNVxcdTAxQjRcXHUwMjRGXFx1MUVGRlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3onLFxuICAgIGNoYXJzOiBcIlxcdTI0RTlcXHVGRjVBXFx1MDE3QVxcdTFFOTFcXHUwMTdDXFx1MDE3RVxcdTFFOTNcXHUxRTk1XFx1MDFCNlxcdTAyMjVcXHUwMjQwXFx1MkM2Q1xcdUE3NjNcIixcbiAgfVxuXTtcblxudmFyIGRpYWNyaXRpY3NNYXAgPSB7fTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcmVwbGFjZW1lbnRMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gIHZhciBjaGFycyA9IHJlcGxhY2VtZW50TGlzdFtpXS5jaGFycztcbiAgZm9yICh2YXIgaiA9IDA7IGogPCBjaGFycy5sZW5ndGg7IGogKz0gMSkge1xuICAgIGRpYWNyaXRpY3NNYXBbY2hhcnNbal1dID0gcmVwbGFjZW1lbnRMaXN0W2ldLmJhc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRGlhY3JpdGljcyhzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXlxcdTAwMDAtXFx1MDA3ZV0vZywgZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBkaWFjcml0aWNzTWFwW2NdIHx8IGM7XG4gIH0pO1xufVxuIiwiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoW10sZSk7ZWxzZXt2YXIgdDt0PVwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Z2xvYmFsOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmP3NlbGY6dGhpcyx0LmZsZXhpYmlsaXR5PWUoKX19KGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uIGUodCxyLGwpe2Z1bmN0aW9uIG4oZixpKXtpZighcltmXSl7aWYoIXRbZl0pe3ZhciBzPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWkmJnMpcmV0dXJuIHMoZiwhMCk7aWYobylyZXR1cm4gbyhmLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2YrXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBjPXJbZl09e2V4cG9ydHM6e319O3RbZl1bMF0uY2FsbChjLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIHI9dFtmXVsxXVtlXTtyZXR1cm4gbihyP3I6ZSl9LGMsYy5leHBvcnRzLGUsdCxyLGwpfXJldHVybiByW2ZdLmV4cG9ydHN9Zm9yKHZhciBvPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsZj0wO2Y8bC5sZW5ndGg7ZisrKW4obFtmXSk7cmV0dXJuIG59KHsxOltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe3ZhciB0LHIsbCxuPS0xO2lmKGUubGluZXMubGVuZ3RoPjEmJlwiZmxleC1zdGFydFwiPT09ZS5zdHlsZS5hbGlnbkNvbnRlbnQpZm9yKHQ9MDtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsdCs9bC5jcm9zcztlbHNlIGlmKGUubGluZXMubGVuZ3RoPjEmJlwiZmxleC1lbmRcIj09PWUuc3R5bGUuYWxpZ25Db250ZW50KWZvcih0PWUuZmxleFN0eWxlLmNyb3NzU3BhY2U7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LHQrPWwuY3Jvc3M7ZWxzZSBpZihlLmxpbmVzLmxlbmd0aD4xJiZcImNlbnRlclwiPT09ZS5zdHlsZS5hbGlnbkNvbnRlbnQpZm9yKHQ9ZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZS8yO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCx0Kz1sLmNyb3NzO2Vsc2UgaWYoZS5saW5lcy5sZW5ndGg+MSYmXCJzcGFjZS1iZXR3ZWVuXCI9PT1lLnN0eWxlLmFsaWduQ29udGVudClmb3Iocj1lLmZsZXhTdHlsZS5jcm9zc1NwYWNlLyhlLmxpbmVzLmxlbmd0aC0xKSx0PTA7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LHQrPWwuY3Jvc3MrcjtlbHNlIGlmKGUubGluZXMubGVuZ3RoPjEmJlwic3BhY2UtYXJvdW5kXCI9PT1lLnN0eWxlLmFsaWduQ29udGVudClmb3Iocj0yKmUuZmxleFN0eWxlLmNyb3NzU3BhY2UvKDIqZS5saW5lcy5sZW5ndGgpLHQ9ci8yO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCx0Kz1sLmNyb3NzK3I7ZWxzZSBmb3Iocj1lLmZsZXhTdHlsZS5jcm9zc1NwYWNlL2UubGluZXMubGVuZ3RoLHQ9ZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckJlZm9yZTtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsbC5jcm9zcys9cix0Kz1sLmNyb3NzfX0se31dLDI6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7Zm9yKHZhciB0LHI9LTE7bGluZT1lLmxpbmVzWysrcl07KWZvcih0PS0xO2NoaWxkPWxpbmUuY2hpbGRyZW5bKyt0XTspe3ZhciBsPWNoaWxkLnN0eWxlLmFsaWduU2VsZjtcImF1dG9cIj09PWwmJihsPWUuc3R5bGUuYWxpZ25JdGVtcyksXCJmbGV4LXN0YXJ0XCI9PT1sP2NoaWxkLmZsZXhTdHlsZS5jcm9zc1N0YXJ0PWxpbmUuY3Jvc3NTdGFydDpcImZsZXgtZW5kXCI9PT1sP2NoaWxkLmZsZXhTdHlsZS5jcm9zc1N0YXJ0PWxpbmUuY3Jvc3NTdGFydCtsaW5lLmNyb3NzLWNoaWxkLmZsZXhTdHlsZS5jcm9zc091dGVyOlwiY2VudGVyXCI9PT1sP2NoaWxkLmZsZXhTdHlsZS5jcm9zc1N0YXJ0PWxpbmUuY3Jvc3NTdGFydCsobGluZS5jcm9zcy1jaGlsZC5mbGV4U3R5bGUuY3Jvc3NPdXRlcikvMjooY2hpbGQuZmxleFN0eWxlLmNyb3NzU3RhcnQ9bGluZS5jcm9zc1N0YXJ0LGNoaWxkLmZsZXhTdHlsZS5jcm9zc091dGVyPWxpbmUuY3Jvc3MsY2hpbGQuZmxleFN0eWxlLmNyb3NzPWNoaWxkLmZsZXhTdHlsZS5jcm9zc091dGVyLWNoaWxkLmZsZXhTdHlsZS5jcm9zc0JlZm9yZS1jaGlsZC5mbGV4U3R5bGUuY3Jvc3NBZnRlcil9fX0se31dLDM6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24gbChlLGwpe3ZhciB0PVwicm93XCI9PT1sfHxcInJvdy1yZXZlcnNlXCI9PT1sLHI9ZS5tYWluQXhpcztpZihyKXt2YXIgbj10JiZcImlubGluZVwiPT09cnx8IXQmJlwiYmxvY2tcIj09PXI7bnx8KGUuZmxleFN0eWxlPXttYWluOmUuZmxleFN0eWxlLmNyb3NzLGNyb3NzOmUuZmxleFN0eWxlLm1haW4sbWFpbk9mZnNldDplLmZsZXhTdHlsZS5jcm9zc09mZnNldCxjcm9zc09mZnNldDplLmZsZXhTdHlsZS5tYWluT2Zmc2V0LG1haW5CZWZvcmU6ZS5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUsbWFpbkFmdGVyOmUuZmxleFN0eWxlLmNyb3NzQWZ0ZXIsY3Jvc3NCZWZvcmU6ZS5mbGV4U3R5bGUubWFpbkJlZm9yZSxjcm9zc0FmdGVyOmUuZmxleFN0eWxlLm1haW5BZnRlcixtYWluSW5uZXJCZWZvcmU6ZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckJlZm9yZSxtYWluSW5uZXJBZnRlcjplLmZsZXhTdHlsZS5jcm9zc0lubmVyQWZ0ZXIsY3Jvc3NJbm5lckJlZm9yZTplLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUsY3Jvc3NJbm5lckFmdGVyOmUuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyLG1haW5Cb3JkZXJCZWZvcmU6ZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJCZWZvcmUsbWFpbkJvcmRlckFmdGVyOmUuZmxleFN0eWxlLmNyb3NzQm9yZGVyQWZ0ZXIsY3Jvc3NCb3JkZXJCZWZvcmU6ZS5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZSxjcm9zc0JvcmRlckFmdGVyOmUuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlcn0pfWVsc2UgdD9lLmZsZXhTdHlsZT17bWFpbjplLnN0eWxlLndpZHRoLGNyb3NzOmUuc3R5bGUuaGVpZ2h0LG1haW5PZmZzZXQ6ZS5zdHlsZS5vZmZzZXRXaWR0aCxjcm9zc09mZnNldDplLnN0eWxlLm9mZnNldEhlaWdodCxtYWluQmVmb3JlOmUuc3R5bGUubWFyZ2luTGVmdCxtYWluQWZ0ZXI6ZS5zdHlsZS5tYXJnaW5SaWdodCxjcm9zc0JlZm9yZTplLnN0eWxlLm1hcmdpblRvcCxjcm9zc0FmdGVyOmUuc3R5bGUubWFyZ2luQm90dG9tLG1haW5Jbm5lckJlZm9yZTplLnN0eWxlLnBhZGRpbmdMZWZ0LG1haW5Jbm5lckFmdGVyOmUuc3R5bGUucGFkZGluZ1JpZ2h0LGNyb3NzSW5uZXJCZWZvcmU6ZS5zdHlsZS5wYWRkaW5nVG9wLGNyb3NzSW5uZXJBZnRlcjplLnN0eWxlLnBhZGRpbmdCb3R0b20sbWFpbkJvcmRlckJlZm9yZTplLnN0eWxlLmJvcmRlckxlZnRXaWR0aCxtYWluQm9yZGVyQWZ0ZXI6ZS5zdHlsZS5ib3JkZXJSaWdodFdpZHRoLGNyb3NzQm9yZGVyQmVmb3JlOmUuc3R5bGUuYm9yZGVyVG9wV2lkdGgsY3Jvc3NCb3JkZXJBZnRlcjplLnN0eWxlLmJvcmRlckJvdHRvbVdpZHRofTplLmZsZXhTdHlsZT17bWFpbjplLnN0eWxlLmhlaWdodCxjcm9zczplLnN0eWxlLndpZHRoLG1haW5PZmZzZXQ6ZS5zdHlsZS5vZmZzZXRIZWlnaHQsY3Jvc3NPZmZzZXQ6ZS5zdHlsZS5vZmZzZXRXaWR0aCxtYWluQmVmb3JlOmUuc3R5bGUubWFyZ2luVG9wLG1haW5BZnRlcjplLnN0eWxlLm1hcmdpbkJvdHRvbSxjcm9zc0JlZm9yZTplLnN0eWxlLm1hcmdpbkxlZnQsY3Jvc3NBZnRlcjplLnN0eWxlLm1hcmdpblJpZ2h0LG1haW5Jbm5lckJlZm9yZTplLnN0eWxlLnBhZGRpbmdUb3AsbWFpbklubmVyQWZ0ZXI6ZS5zdHlsZS5wYWRkaW5nQm90dG9tLGNyb3NzSW5uZXJCZWZvcmU6ZS5zdHlsZS5wYWRkaW5nTGVmdCxjcm9zc0lubmVyQWZ0ZXI6ZS5zdHlsZS5wYWRkaW5nUmlnaHQsbWFpbkJvcmRlckJlZm9yZTplLnN0eWxlLmJvcmRlclRvcFdpZHRoLG1haW5Cb3JkZXJBZnRlcjplLnN0eWxlLmJvcmRlckJvdHRvbVdpZHRoLGNyb3NzQm9yZGVyQmVmb3JlOmUuc3R5bGUuYm9yZGVyTGVmdFdpZHRoLGNyb3NzQm9yZGVyQWZ0ZXI6ZS5zdHlsZS5ib3JkZXJSaWdodFdpZHRofSxcImNvbnRlbnQtYm94XCI9PT1lLnN0eWxlLmJveFNpemluZyYmKFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5tYWluJiYoZS5mbGV4U3R5bGUubWFpbis9ZS5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyKSxcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUuY3Jvc3MmJihlLmZsZXhTdHlsZS5jcm9zcys9ZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckJlZm9yZStlLmZsZXhTdHlsZS5jcm9zc0lubmVyQWZ0ZXIrZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJCZWZvcmUrZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJBZnRlcikpO2UubWFpbkF4aXM9dD9cImlubGluZVwiOlwiYmxvY2tcIixlLmNyb3NzQXhpcz10P1wiYmxvY2tcIjpcImlubGluZVwiLFwibnVtYmVyXCI9PXR5cGVvZiBlLnN0eWxlLmZsZXhCYXNpcyYmKGUuZmxleFN0eWxlLm1haW49ZS5zdHlsZS5mbGV4QmFzaXMrZS5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyKSxlLmZsZXhTdHlsZS5tYWluT3V0ZXI9ZS5mbGV4U3R5bGUubWFpbixlLmZsZXhTdHlsZS5jcm9zc091dGVyPWUuZmxleFN0eWxlLmNyb3NzLFwiYXV0b1wiPT09ZS5mbGV4U3R5bGUubWFpbk91dGVyJiYoZS5mbGV4U3R5bGUubWFpbk91dGVyPWUuZmxleFN0eWxlLm1haW5PZmZzZXQpLFwiYXV0b1wiPT09ZS5mbGV4U3R5bGUuY3Jvc3NPdXRlciYmKGUuZmxleFN0eWxlLmNyb3NzT3V0ZXI9ZS5mbGV4U3R5bGUuY3Jvc3NPZmZzZXQpLFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5tYWluQmVmb3JlJiYoZS5mbGV4U3R5bGUubWFpbk91dGVyKz1lLmZsZXhTdHlsZS5tYWluQmVmb3JlKSxcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUubWFpbkFmdGVyJiYoZS5mbGV4U3R5bGUubWFpbk91dGVyKz1lLmZsZXhTdHlsZS5tYWluQWZ0ZXIpLFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5jcm9zc0JlZm9yZSYmKGUuZmxleFN0eWxlLmNyb3NzT3V0ZXIrPWUuZmxleFN0eWxlLmNyb3NzQmVmb3JlKSxcIm51bWJlclwiPT10eXBlb2YgZS5mbGV4U3R5bGUuY3Jvc3NBZnRlciYmKGUuZmxleFN0eWxlLmNyb3NzT3V0ZXIrPWUuZmxleFN0eWxlLmNyb3NzQWZ0ZXIpfX0se31dLDQ6W2Z1bmN0aW9uKGUsdCxyKXt2YXIgbD1lKFwiLi4vcmVkdWNlXCIpO3QuZXhwb3J0cz1mdW5jdGlvbihlKXtpZihlLm1haW5TcGFjZT4wKXt2YXIgdD1sKGUuY2hpbGRyZW4sZnVuY3Rpb24oZSx0KXtyZXR1cm4gZStwYXJzZUZsb2F0KHQuc3R5bGUuZmxleEdyb3cpfSwwKTt0PjAmJihlLm1haW49bChlLmNoaWxkcmVuLGZ1bmN0aW9uKHIsbCl7cmV0dXJuXCJhdXRvXCI9PT1sLmZsZXhTdHlsZS5tYWluP2wuZmxleFN0eWxlLm1haW49bC5mbGV4U3R5bGUubWFpbk9mZnNldCtwYXJzZUZsb2F0KGwuc3R5bGUuZmxleEdyb3cpL3QqZS5tYWluU3BhY2U6bC5mbGV4U3R5bGUubWFpbis9cGFyc2VGbG9hdChsLnN0eWxlLmZsZXhHcm93KS90KmUubWFpblNwYWNlLGwuZmxleFN0eWxlLm1haW5PdXRlcj1sLmZsZXhTdHlsZS5tYWluK2wuZmxleFN0eWxlLm1haW5CZWZvcmUrbC5mbGV4U3R5bGUubWFpbkFmdGVyLHIrbC5mbGV4U3R5bGUubWFpbk91dGVyfSwwKSxlLm1haW5TcGFjZT0wKX19fSx7XCIuLi9yZWR1Y2VcIjoxMn1dLDU6W2Z1bmN0aW9uKGUsdCxyKXt2YXIgbD1lKFwiLi4vcmVkdWNlXCIpO3QuZXhwb3J0cz1mdW5jdGlvbihlKXtpZihlLm1haW5TcGFjZTwwKXt2YXIgdD1sKGUuY2hpbGRyZW4sZnVuY3Rpb24oZSx0KXtyZXR1cm4gZStwYXJzZUZsb2F0KHQuc3R5bGUuZmxleFNocmluayl9LDApO3Q+MCYmKGUubWFpbj1sKGUuY2hpbGRyZW4sZnVuY3Rpb24ocixsKXtyZXR1cm4gbC5mbGV4U3R5bGUubWFpbis9cGFyc2VGbG9hdChsLnN0eWxlLmZsZXhTaHJpbmspL3QqZS5tYWluU3BhY2UsbC5mbGV4U3R5bGUubWFpbk91dGVyPWwuZmxleFN0eWxlLm1haW4rbC5mbGV4U3R5bGUubWFpbkJlZm9yZStsLmZsZXhTdHlsZS5tYWluQWZ0ZXIscitsLmZsZXhTdHlsZS5tYWluT3V0ZXJ9LDApLGUubWFpblNwYWNlPTApfX19LHtcIi4uL3JlZHVjZVwiOjEyfV0sNjpbZnVuY3Rpb24oZSx0LHIpe3ZhciBsPWUoXCIuLi9yZWR1Y2VcIik7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe3ZhciB0O2UubGluZXM9W3Q9e21haW46MCxjcm9zczowLGNoaWxkcmVuOltdfV07Zm9yKHZhciByLG49LTE7cj1lLmNoaWxkcmVuWysrbl07KVwibm93cmFwXCI9PT1lLnN0eWxlLmZsZXhXcmFwfHwwPT09dC5jaGlsZHJlbi5sZW5ndGh8fFwiYXV0b1wiPT09ZS5mbGV4U3R5bGUubWFpbnx8ZS5mbGV4U3R5bGUubWFpbi1lLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUtZS5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXItZS5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZS1lLmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXI+PXQubWFpbityLmZsZXhTdHlsZS5tYWluT3V0ZXI/KHQubWFpbis9ci5mbGV4U3R5bGUubWFpbk91dGVyLHQuY3Jvc3M9TWF0aC5tYXgodC5jcm9zcyxyLmZsZXhTdHlsZS5jcm9zc091dGVyKSk6ZS5saW5lcy5wdXNoKHQ9e21haW46ci5mbGV4U3R5bGUubWFpbk91dGVyLGNyb3NzOnIuZmxleFN0eWxlLmNyb3NzT3V0ZXIsY2hpbGRyZW46W119KSx0LmNoaWxkcmVuLnB1c2gocik7ZS5mbGV4U3R5bGUubWFpbkxpbmVzPWwoZS5saW5lcyxmdW5jdGlvbihlLHQpe3JldHVybiBNYXRoLm1heChlLHQubWFpbil9LDApLGUuZmxleFN0eWxlLmNyb3NzTGluZXM9bChlLmxpbmVzLGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUrdC5jcm9zc30sMCksXCJhdXRvXCI9PT1lLmZsZXhTdHlsZS5tYWluJiYoZS5mbGV4U3R5bGUubWFpbj1NYXRoLm1heChlLmZsZXhTdHlsZS5tYWluT2Zmc2V0LGUuZmxleFN0eWxlLm1haW5MaW5lcytlLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXIrZS5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZStlLmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXIpKSxcImF1dG9cIj09PWUuZmxleFN0eWxlLmNyb3NzJiYoZS5mbGV4U3R5bGUuY3Jvc3M9TWF0aC5tYXgoZS5mbGV4U3R5bGUuY3Jvc3NPZmZzZXQsZS5mbGV4U3R5bGUuY3Jvc3NMaW5lcytlLmZsZXhTdHlsZS5jcm9zc0lubmVyQmVmb3JlK2UuZmxleFN0eWxlLmNyb3NzSW5uZXJBZnRlcitlLmZsZXhTdHlsZS5jcm9zc0JvcmRlckJlZm9yZStlLmZsZXhTdHlsZS5jcm9zc0JvcmRlckFmdGVyKSksZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZT1lLmZsZXhTdHlsZS5jcm9zcy1lLmZsZXhTdHlsZS5jcm9zc0lubmVyQmVmb3JlLWUuZmxleFN0eWxlLmNyb3NzSW5uZXJBZnRlci1lLmZsZXhTdHlsZS5jcm9zc0JvcmRlckJlZm9yZS1lLmZsZXhTdHlsZS5jcm9zc0JvcmRlckFmdGVyLWUuZmxleFN0eWxlLmNyb3NzTGluZXMsZS5mbGV4U3R5bGUubWFpbk91dGVyPWUuZmxleFN0eWxlLm1haW4rZS5mbGV4U3R5bGUubWFpbkJlZm9yZStlLmZsZXhTdHlsZS5tYWluQWZ0ZXIsZS5mbGV4U3R5bGUuY3Jvc3NPdXRlcj1lLmZsZXhTdHlsZS5jcm9zcytlLmZsZXhTdHlsZS5jcm9zc0JlZm9yZStlLmZsZXhTdHlsZS5jcm9zc0FmdGVyfX0se1wiLi4vcmVkdWNlXCI6MTJ9XSw3OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbCh0KXtmb3IodmFyIHIsbD0tMTtyPXQuY2hpbGRyZW5bKytsXTspZShcIi4vZmxleC1kaXJlY3Rpb25cIikocix0LnN0eWxlLmZsZXhEaXJlY3Rpb24pO2UoXCIuL2ZsZXgtZGlyZWN0aW9uXCIpKHQsdC5zdHlsZS5mbGV4RGlyZWN0aW9uKSxlKFwiLi9vcmRlclwiKSh0KSxlKFwiLi9mbGV4Ym94LWxpbmVzXCIpKHQpLGUoXCIuL2FsaWduLWNvbnRlbnRcIikodCksbD0tMTtmb3IodmFyIG47bj10LmxpbmVzWysrbF07KW4ubWFpblNwYWNlPXQuZmxleFN0eWxlLm1haW4tdC5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlLXQuZmxleFN0eWxlLm1haW5Jbm5lckFmdGVyLXQuZmxleFN0eWxlLm1haW5Cb3JkZXJCZWZvcmUtdC5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyLW4ubWFpbixlKFwiLi9mbGV4LWdyb3dcIikobiksZShcIi4vZmxleC1zaHJpbmtcIikobiksZShcIi4vbWFyZ2luLW1haW5cIikobiksZShcIi4vbWFyZ2luLWNyb3NzXCIpKG4pLGUoXCIuL2p1c3RpZnktY29udGVudFwiKShuLHQuc3R5bGUuanVzdGlmeUNvbnRlbnQsdCk7ZShcIi4vYWxpZ24taXRlbXNcIikodCl9dC5leHBvcnRzPWx9LHtcIi4vYWxpZ24tY29udGVudFwiOjEsXCIuL2FsaWduLWl0ZW1zXCI6MixcIi4vZmxleC1kaXJlY3Rpb25cIjozLFwiLi9mbGV4LWdyb3dcIjo0LFwiLi9mbGV4LXNocmlua1wiOjUsXCIuL2ZsZXhib3gtbGluZXNcIjo2LFwiLi9qdXN0aWZ5LWNvbnRlbnRcIjo4LFwiLi9tYXJnaW4tY3Jvc3NcIjo5LFwiLi9tYXJnaW4tbWFpblwiOjEwLFwiLi9vcmRlclwiOjExfV0sODpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbihlLHQscil7dmFyIGwsbixvLGY9ci5mbGV4U3R5bGUubWFpbklubmVyQmVmb3JlLGk9LTE7aWYoXCJmbGV4LWVuZFwiPT09dClmb3IobD1lLm1haW5TcGFjZSxsKz1mO289ZS5jaGlsZHJlblsrK2ldOylvLmZsZXhTdHlsZS5tYWluU3RhcnQ9bCxsKz1vLmZsZXhTdHlsZS5tYWluT3V0ZXI7ZWxzZSBpZihcImNlbnRlclwiPT09dClmb3IobD1lLm1haW5TcGFjZS8yLGwrPWY7bz1lLmNoaWxkcmVuWysraV07KW8uZmxleFN0eWxlLm1haW5TdGFydD1sLGwrPW8uZmxleFN0eWxlLm1haW5PdXRlcjtlbHNlIGlmKFwic3BhY2UtYmV0d2VlblwiPT09dClmb3Iobj1lLm1haW5TcGFjZS8oZS5jaGlsZHJlbi5sZW5ndGgtMSksbD0wLGwrPWY7bz1lLmNoaWxkcmVuWysraV07KW8uZmxleFN0eWxlLm1haW5TdGFydD1sLGwrPW8uZmxleFN0eWxlLm1haW5PdXRlcituO2Vsc2UgaWYoXCJzcGFjZS1hcm91bmRcIj09PXQpZm9yKG49MiplLm1haW5TcGFjZS8oMiplLmNoaWxkcmVuLmxlbmd0aCksbD1uLzIsbCs9ZjtvPWUuY2hpbGRyZW5bKytpXTspby5mbGV4U3R5bGUubWFpblN0YXJ0PWwsbCs9by5mbGV4U3R5bGUubWFpbk91dGVyK247ZWxzZSBmb3IobD0wLGwrPWY7bz1lLmNoaWxkcmVuWysraV07KW8uZmxleFN0eWxlLm1haW5TdGFydD1sLGwrPW8uZmxleFN0eWxlLm1haW5PdXRlcn19LHt9XSw5OltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2Zvcih2YXIgdCxyPS0xO3Q9ZS5jaGlsZHJlblsrK3JdOyl7dmFyIGw9MDtcImF1dG9cIj09PXQuZmxleFN0eWxlLmNyb3NzQmVmb3JlJiYrK2wsXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5jcm9zc0FmdGVyJiYrK2w7dmFyIG49ZS5jcm9zcy10LmZsZXhTdHlsZS5jcm9zc091dGVyO1wiYXV0b1wiPT09dC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUmJih0LmZsZXhTdHlsZS5jcm9zc0JlZm9yZT1uL2wpLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUuY3Jvc3NBZnRlciYmKHQuZmxleFN0eWxlLmNyb3NzQWZ0ZXI9bi9sKSxcImF1dG9cIj09PXQuZmxleFN0eWxlLmNyb3NzP3QuZmxleFN0eWxlLmNyb3NzT3V0ZXI9dC5mbGV4U3R5bGUuY3Jvc3NPZmZzZXQrdC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUrdC5mbGV4U3R5bGUuY3Jvc3NBZnRlcjp0LmZsZXhTdHlsZS5jcm9zc091dGVyPXQuZmxleFN0eWxlLmNyb3NzK3QuZmxleFN0eWxlLmNyb3NzQmVmb3JlK3QuZmxleFN0eWxlLmNyb3NzQWZ0ZXJ9fX0se31dLDEwOltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2Zvcih2YXIgdCxyPTAsbD0tMTt0PWUuY2hpbGRyZW5bKytsXTspXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5tYWluQmVmb3JlJiYrK3IsXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5tYWluQWZ0ZXImJisrcjtpZihyPjApe2ZvcihsPS0xO3Q9ZS5jaGlsZHJlblsrK2xdOylcImF1dG9cIj09PXQuZmxleFN0eWxlLm1haW5CZWZvcmUmJih0LmZsZXhTdHlsZS5tYWluQmVmb3JlPWUubWFpblNwYWNlL3IpLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUubWFpbkFmdGVyJiYodC5mbGV4U3R5bGUubWFpbkFmdGVyPWUubWFpblNwYWNlL3IpLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUubWFpbj90LmZsZXhTdHlsZS5tYWluT3V0ZXI9dC5mbGV4U3R5bGUubWFpbk9mZnNldCt0LmZsZXhTdHlsZS5tYWluQmVmb3JlK3QuZmxleFN0eWxlLm1haW5BZnRlcjp0LmZsZXhTdHlsZS5tYWluT3V0ZXI9dC5mbGV4U3R5bGUubWFpbit0LmZsZXhTdHlsZS5tYWluQmVmb3JlK3QuZmxleFN0eWxlLm1haW5BZnRlcjtlLm1haW5TcGFjZT0wfX19LHt9XSwxMTpbZnVuY3Rpb24oZSx0LHIpe3ZhciBsPS9eKGNvbHVtbnxyb3cpLXJldmVyc2UkLzt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7ZS5jaGlsZHJlbi5zb3J0KGZ1bmN0aW9uKGUsdCl7cmV0dXJuIGUuc3R5bGUub3JkZXItdC5zdHlsZS5vcmRlcnx8ZS5pbmRleC10LmluZGV4fSksbC50ZXN0KGUuc3R5bGUuZmxleERpcmVjdGlvbikmJmUuY2hpbGRyZW4ucmV2ZXJzZSgpfX0se31dLDEyOltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlLHQscil7Zm9yKHZhciBsPWUubGVuZ3RoLG49LTE7KytuPGw7KW4gaW4gZSYmKHI9dChyLGVbbl0sbikpO3JldHVybiByfXQuZXhwb3J0cz1sfSx7fV0sMTM6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUpe2koZihlKSl9dmFyIG49ZShcIi4vcmVhZFwiKSxvPWUoXCIuL3dyaXRlXCIpLGY9ZShcIi4vcmVhZEFsbFwiKSxpPWUoXCIuL3dyaXRlQWxsXCIpO3QuZXhwb3J0cz1sLHQuZXhwb3J0cy5yZWFkPW4sdC5leHBvcnRzLndyaXRlPW8sdC5leHBvcnRzLnJlYWRBbGw9Zix0LmV4cG9ydHMud3JpdGVBbGw9aX0se1wiLi9yZWFkXCI6MTUsXCIuL3JlYWRBbGxcIjoxNixcIi4vd3JpdGVcIjoxNyxcIi4vd3JpdGVBbGxcIjoxOH1dLDE0OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlLHQscil7dmFyIGw9ZVt0XSxmPVN0cmluZyhsKS5tYXRjaChvKTtpZighZil7dmFyIGE9dC5tYXRjaChzKTtpZihhKXt2YXIgYz1lW1wiYm9yZGVyXCIrYVsxXStcIlN0eWxlXCJdO3JldHVyblwibm9uZVwiPT09Yz8wOmlbbF18fDB9cmV0dXJuIGx9dmFyIHk9ZlsxXSx4PWZbMl07cmV0dXJuXCJweFwiPT09eD8xKnk6XCJjbVwiPT09eD8uMzkzNyp5Kjk2OlwiaW5cIj09PXg/OTYqeTpcIm1tXCI9PT14Py4zOTM3KnkqOTYvMTA6XCJwY1wiPT09eD8xMip5Kjk2LzcyOlwicHRcIj09PXg/OTYqeS83MjpcInJlbVwiPT09eD8xNip5Om4obCxyKX1mdW5jdGlvbiBuKGUsdCl7Zi5zdHlsZS5jc3NUZXh0PVwiYm9yZGVyOm5vbmUhaW1wb3J0YW50O2NsaXA6cmVjdCgwIDAgMCAwKSFpbXBvcnRhbnQ7ZGlzcGxheTpibG9jayFpbXBvcnRhbnQ7Zm9udC1zaXplOjFlbSFpbXBvcnRhbnQ7aGVpZ2h0OjAhaW1wb3J0YW50O21hcmdpbjowIWltcG9ydGFudDtwYWRkaW5nOjAhaW1wb3J0YW50O3Bvc2l0aW9uOnJlbGF0aXZlIWltcG9ydGFudDt3aWR0aDpcIitlK1wiIWltcG9ydGFudFwiLHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZix0Lm5leHRTaWJsaW5nKTt2YXIgcj1mLm9mZnNldFdpZHRoO3JldHVybiB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZikscn10LmV4cG9ydHM9bDt2YXIgbz0vXihbLStdP1xcZCpcXC4/XFxkKykoJXxbYS16XSspJC8sZj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLGk9e21lZGl1bTo0LG5vbmU6MCx0aGljazo2LHRoaW46Mn0scz0vXmJvcmRlcihCb3R0b218TGVmdHxSaWdodHxUb3ApV2lkdGgkL30se31dLDE1OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlKXt2YXIgdD17YWxpZ25Db250ZW50Olwic3RyZXRjaFwiLGFsaWduSXRlbXM6XCJzdHJldGNoXCIsYWxpZ25TZWxmOlwiYXV0b1wiLGJvcmRlckJvdHRvbVN0eWxlOlwibm9uZVwiLGJvcmRlckJvdHRvbVdpZHRoOjAsYm9yZGVyTGVmdFN0eWxlOlwibm9uZVwiLGJvcmRlckxlZnRXaWR0aDowLGJvcmRlclJpZ2h0U3R5bGU6XCJub25lXCIsYm9yZGVyUmlnaHRXaWR0aDowLGJvcmRlclRvcFN0eWxlOlwibm9uZVwiLGJvcmRlclRvcFdpZHRoOjAsYm94U2l6aW5nOlwiY29udGVudC1ib3hcIixkaXNwbGF5OlwiaW5saW5lXCIsZmxleEJhc2lzOlwiYXV0b1wiLGZsZXhEaXJlY3Rpb246XCJyb3dcIixmbGV4R3JvdzowLGZsZXhTaHJpbms6MSxmbGV4V3JhcDpcIm5vd3JhcFwiLGp1c3RpZnlDb250ZW50OlwiZmxleC1zdGFydFwiLGhlaWdodDpcImF1dG9cIixtYXJnaW5Ub3A6MCxtYXJnaW5SaWdodDowLG1hcmdpbkxlZnQ6MCxtYXJnaW5Cb3R0b206MCxwYWRkaW5nVG9wOjAscGFkZGluZ1JpZ2h0OjAscGFkZGluZ0xlZnQ6MCxwYWRkaW5nQm90dG9tOjAsbWF4SGVpZ2h0Olwibm9uZVwiLG1heFdpZHRoOlwibm9uZVwiLG1pbkhlaWdodDowLG1pbldpZHRoOjAsb3JkZXI6MCxwb3NpdGlvbjpcInN0YXRpY1wiLHdpZHRoOlwiYXV0b1wifSxyPWUgaW5zdGFuY2VvZiBFbGVtZW50O2lmKHIpe3ZhciBsPWUuaGFzQXR0cmlidXRlKFwiZGF0YS1zdHlsZVwiKSxpPWw/ZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0eWxlXCIpOmUuZ2V0QXR0cmlidXRlKFwic3R5bGVcIil8fFwiXCI7bHx8ZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0eWxlXCIsaSk7dmFyIHM9d2luZG93LmdldENvbXB1dGVkU3R5bGUmJmdldENvbXB1dGVkU3R5bGUoZSl8fHt9O2YodCxzKTt2YXIgYz1lLmN1cnJlbnRTdHlsZXx8e307bih0LGMpLG8odCxpKTtmb3IodmFyIHkgaW4gdCl0W3ldPWEodCx5LGUpO3ZhciB4PWUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7dC5vZmZzZXRIZWlnaHQ9eC5oZWlnaHR8fGUub2Zmc2V0SGVpZ2h0LHQub2Zmc2V0V2lkdGg9eC53aWR0aHx8ZS5vZmZzZXRXaWR0aH12YXIgUz17ZWxlbWVudDplLHN0eWxlOnR9O3JldHVybiBTfWZ1bmN0aW9uIG4oZSx0KXtmb3IodmFyIHIgaW4gZSl7dmFyIGw9ciBpbiB0O2lmKGwpZVtyXT10W3JdO2Vsc2V7dmFyIG49ci5yZXBsYWNlKC9bQS1aXS9nLFwiLSQmXCIpLnRvTG93ZXJDYXNlKCksbz1uIGluIHQ7byYmKGVbcl09dFtuXSl9fXZhciBmPVwiLWpzLWRpc3BsYXlcImluIHQ7ZiYmKGUuZGlzcGxheT10W1wiLWpzLWRpc3BsYXlcIl0pfWZ1bmN0aW9uIG8oZSx0KXtmb3IodmFyIHI7cj1pLmV4ZWModCk7KXt2YXIgbD1yWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvLVthLXpdL2csZnVuY3Rpb24oZSl7cmV0dXJuIGUuc2xpY2UoMSkudG9VcHBlckNhc2UoKX0pO2VbbF09clsyXX19ZnVuY3Rpb24gZihlLHQpe2Zvcih2YXIgciBpbiBlKXt2YXIgbD1yIGluIHQ7bCYmIXMudGVzdChyKSYmKGVbcl09dFtyXSl9fXQuZXhwb3J0cz1sO3ZhciBpPS8oW15cXHM6O10rKVxccyo6XFxzKihbXjtdKz8pXFxzKig7fCQpL2cscz0vXihhbGlnblNlbGZ8aGVpZ2h0fHdpZHRoKSQvLGE9ZShcIi4vZ2V0Q29tcHV0ZWRMZW5ndGhcIil9LHtcIi4vZ2V0Q29tcHV0ZWRMZW5ndGhcIjoxNH1dLDE2OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlKXt2YXIgdD1bXTtyZXR1cm4gbihlLHQpLHR9ZnVuY3Rpb24gbihlLHQpe2Zvcih2YXIgcixsPW8oZSksaT1bXSxzPS0xO3I9ZS5jaGlsZE5vZGVzWysrc107KXt2YXIgYT0zPT09ci5ub2RlVHlwZSYmIS9eXFxzKiQvLnRlc3Qoci5ub2RlVmFsdWUpO2lmKGwmJmEpe3ZhciBjPXI7cj1lLmluc2VydEJlZm9yZShkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZmxleC1pdGVtXCIpLGMpLHIuYXBwZW5kQ2hpbGQoYyl9dmFyIHk9ciBpbnN0YW5jZW9mIEVsZW1lbnQ7aWYoeSl7dmFyIHg9bihyLHQpO2lmKGwpe3ZhciBTPXIuc3R5bGU7Uy5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIsUy5wb3NpdGlvbj1cImFic29sdXRlXCIseC5zdHlsZT1mKHIpLnN0eWxlLGkucHVzaCh4KX19fXZhciBtPXtlbGVtZW50OmUsY2hpbGRyZW46aX07cmV0dXJuIGwmJihtLnN0eWxlPWYoZSkuc3R5bGUsdC5wdXNoKG0pKSxtfWZ1bmN0aW9uIG8oZSl7dmFyIHQ9ZSBpbnN0YW5jZW9mIEVsZW1lbnQscj10JiZlLmdldEF0dHJpYnV0ZShcImRhdGEtc3R5bGVcIiksbD10JiZlLmN1cnJlbnRTdHlsZSYmZS5jdXJyZW50U3R5bGVbXCItanMtZGlzcGxheVwiXSxuPWkudGVzdChyKXx8cy50ZXN0KGwpO3JldHVybiBufXQuZXhwb3J0cz1sO3ZhciBmPWUoXCIuLi9yZWFkXCIpLGk9LyhefDspXFxzKmRpc3BsYXlcXHMqOlxccyooaW5saW5lLSk/ZmxleFxccyooO3wkKS9pLHM9L14oaW5saW5lLSk/ZmxleCQvaX0se1wiLi4vcmVhZFwiOjE1fV0sMTc6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUpe28oZSk7dmFyIHQ9ZS5lbGVtZW50LnN0eWxlLHI9XCJpbmxpbmVcIj09PWUubWFpbkF4aXM/W1wibWFpblwiLFwiY3Jvc3NcIl06W1wiY3Jvc3NcIixcIm1haW5cIl07dC5ib3hTaXppbmc9XCJjb250ZW50LWJveFwiLHQuZGlzcGxheT1cImJsb2NrXCIsdC5wb3NpdGlvbj1cInJlbGF0aXZlXCIsdC53aWR0aD1uKGUuZmxleFN0eWxlW3JbMF1dLWUuZmxleFN0eWxlW3JbMF0rXCJJbm5lckJlZm9yZVwiXS1lLmZsZXhTdHlsZVtyWzBdK1wiSW5uZXJBZnRlclwiXS1lLmZsZXhTdHlsZVtyWzBdK1wiQm9yZGVyQmVmb3JlXCJdLWUuZmxleFN0eWxlW3JbMF0rXCJCb3JkZXJBZnRlclwiXSksdC5oZWlnaHQ9bihlLmZsZXhTdHlsZVtyWzFdXS1lLmZsZXhTdHlsZVtyWzFdK1wiSW5uZXJCZWZvcmVcIl0tZS5mbGV4U3R5bGVbclsxXStcIklubmVyQWZ0ZXJcIl0tZS5mbGV4U3R5bGVbclsxXStcIkJvcmRlckJlZm9yZVwiXS1lLmZsZXhTdHlsZVtyWzFdK1wiQm9yZGVyQWZ0ZXJcIl0pO2Zvcih2YXIgbCxmPS0xO2w9ZS5jaGlsZHJlblsrK2ZdOyl7dmFyIGk9bC5lbGVtZW50LnN0eWxlLHM9XCJpbmxpbmVcIj09PWwubWFpbkF4aXM/W1wibWFpblwiLFwiY3Jvc3NcIl06W1wiY3Jvc3NcIixcIm1haW5cIl07aS5ib3hTaXppbmc9XCJjb250ZW50LWJveFwiLGkuZGlzcGxheT1cImJsb2NrXCIsaS5wb3NpdGlvbj1cImFic29sdXRlXCIsXCJhdXRvXCIhPT1sLmZsZXhTdHlsZVtzWzBdXSYmKGkud2lkdGg9bihsLmZsZXhTdHlsZVtzWzBdXS1sLmZsZXhTdHlsZVtzWzBdK1wiSW5uZXJCZWZvcmVcIl0tbC5mbGV4U3R5bGVbc1swXStcIklubmVyQWZ0ZXJcIl0tbC5mbGV4U3R5bGVbc1swXStcIkJvcmRlckJlZm9yZVwiXS1sLmZsZXhTdHlsZVtzWzBdK1wiQm9yZGVyQWZ0ZXJcIl0pKSxcImF1dG9cIiE9PWwuZmxleFN0eWxlW3NbMV1dJiYoaS5oZWlnaHQ9bihsLmZsZXhTdHlsZVtzWzFdXS1sLmZsZXhTdHlsZVtzWzFdK1wiSW5uZXJCZWZvcmVcIl0tbC5mbGV4U3R5bGVbc1sxXStcIklubmVyQWZ0ZXJcIl0tbC5mbGV4U3R5bGVbc1sxXStcIkJvcmRlckJlZm9yZVwiXS1sLmZsZXhTdHlsZVtzWzFdK1wiQm9yZGVyQWZ0ZXJcIl0pKSxpLnRvcD1uKGwuZmxleFN0eWxlW3NbMV0rXCJTdGFydFwiXSksaS5sZWZ0PW4obC5mbGV4U3R5bGVbc1swXStcIlN0YXJ0XCJdKSxpLm1hcmdpblRvcD1uKGwuZmxleFN0eWxlW3NbMV0rXCJCZWZvcmVcIl0pLGkubWFyZ2luUmlnaHQ9bihsLmZsZXhTdHlsZVtzWzBdK1wiQWZ0ZXJcIl0pLGkubWFyZ2luQm90dG9tPW4obC5mbGV4U3R5bGVbc1sxXStcIkFmdGVyXCJdKSxpLm1hcmdpbkxlZnQ9bihsLmZsZXhTdHlsZVtzWzBdK1wiQmVmb3JlXCJdKX19ZnVuY3Rpb24gbihlKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgZT9lOk1hdGgubWF4KGUsMCkrXCJweFwifXQuZXhwb3J0cz1sO3ZhciBvPWUoXCIuLi9mbGV4Ym94XCIpfSx7XCIuLi9mbGV4Ym94XCI6N31dLDE4OltmdW5jdGlvbihlLHQscil7ZnVuY3Rpb24gbChlKXtmb3IodmFyIHQscj0tMTt0PWVbKytyXTspbih0KX10LmV4cG9ydHM9bDt2YXIgbj1lKFwiLi4vd3JpdGVcIil9LHtcIi4uL3dyaXRlXCI6MTd9XX0se30sWzEzXSkoMTMpfSk7IiwiLypcbiAqIEZ1enp5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vbXlvcmsvZnV6enlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTWF0dCBZb3JrXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG52YXIgcm9vdCA9IHRoaXM7XG5cbnZhciBmdXp6eSA9IHt9O1xuXG4vLyBVc2UgaW4gbm9kZSBvciBpbiBicm93c2VyXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gZnV6enk7XG59IGVsc2Uge1xuICByb290LmZ1enp5ID0gZnV6enk7XG59XG5cbi8vIFJldHVybiBhbGwgZWxlbWVudHMgb2YgYGFycmF5YCB0aGF0IGhhdmUgYSBmdXp6eVxuLy8gbWF0Y2ggYWdhaW5zdCBgcGF0dGVybmAuXG5mdXp6eS5zaW1wbGVGaWx0ZXIgPSBmdW5jdGlvbihwYXR0ZXJuLCBhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKHN0cmluZykge1xuICAgIHJldHVybiBmdXp6eS50ZXN0KHBhdHRlcm4sIHN0cmluZyk7XG4gIH0pO1xufTtcblxuLy8gRG9lcyBgcGF0dGVybmAgZnV6enkgbWF0Y2ggYHN0cmluZ2A/XG5mdXp6eS50ZXN0ID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nKSB7XG4gIHJldHVybiBmdXp6eS5tYXRjaChwYXR0ZXJuLCBzdHJpbmcpICE9PSBudWxsO1xufTtcblxuLy8gSWYgYHBhdHRlcm5gIG1hdGNoZXMgYHN0cmluZ2AsIHdyYXAgZWFjaCBtYXRjaGluZyBjaGFyYWN0ZXJcbi8vIGluIGBvcHRzLnByZWAgYW5kIGBvcHRzLnBvc3RgLiBJZiBubyBtYXRjaCwgcmV0dXJuIG51bGxcbmZ1enp5Lm1hdGNoID0gZnVuY3Rpb24ocGF0dGVybiwgc3RyaW5nLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICB2YXIgcGF0dGVybklkeCA9IDBcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gICAgLCB0b3RhbFNjb3JlID0gMFxuICAgICwgY3VyclNjb3JlID0gMFxuICAgIC8vIHByZWZpeFxuICAgICwgcHJlID0gb3B0cy5wcmUgfHwgJydcbiAgICAvLyBzdWZmaXhcbiAgICAsIHBvc3QgPSBvcHRzLnBvc3QgfHwgJydcbiAgICAvLyBTdHJpbmcgdG8gY29tcGFyZSBhZ2FpbnN0LiBUaGlzIG1pZ2h0IGJlIGEgbG93ZXJjYXNlIHZlcnNpb24gb2YgdGhlXG4gICAgLy8gcmF3IHN0cmluZ1xuICAgICwgY29tcGFyZVN0cmluZyA9ICBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgc3RyaW5nIHx8IHN0cmluZy50b0xvd2VyQ2FzZSgpXG4gICAgLCBjaCwgY29tcGFyZUNoYXI7XG5cbiAgcGF0dGVybiA9IG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBwYXR0ZXJuIHx8IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAvLyBGb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZywgZWl0aGVyIGFkZCBpdCB0byB0aGUgcmVzdWx0XG4gIC8vIG9yIHdyYXAgaW4gdGVtcGxhdGUgaWYgaXQncyB0aGUgbmV4dCBzdHJpbmcgaW4gdGhlIHBhdHRlcm5cbiAgZm9yKHZhciBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgY2ggPSBzdHJpbmdbaWR4XTtcbiAgICBpZihjb21wYXJlU3RyaW5nW2lkeF0gPT09IHBhdHRlcm5bcGF0dGVybklkeF0pIHtcbiAgICAgIGNoID0gcHJlICsgY2ggKyBwb3N0O1xuICAgICAgcGF0dGVybklkeCArPSAxO1xuXG4gICAgICAvLyBjb25zZWN1dGl2ZSBjaGFyYWN0ZXJzIHNob3VsZCBpbmNyZWFzZSB0aGUgc2NvcmUgbW9yZSB0aGFuIGxpbmVhcmx5XG4gICAgICBjdXJyU2NvcmUgKz0gMSArIGN1cnJTY29yZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyclNjb3JlID0gMDtcbiAgICB9XG4gICAgdG90YWxTY29yZSArPSBjdXJyU2NvcmU7XG4gICAgcmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gY2g7XG4gIH1cblxuICAvLyByZXR1cm4gcmVuZGVyZWQgc3RyaW5nIGlmIHdlIGhhdmUgYSBtYXRjaCBmb3IgZXZlcnkgY2hhclxuICBpZihwYXR0ZXJuSWR4ID09PSBwYXR0ZXJuLmxlbmd0aCkge1xuICAgIHJldHVybiB7cmVuZGVyZWQ6IHJlc3VsdC5qb2luKCcnKSwgc2NvcmU6IHRvdGFsU2NvcmV9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vLyBUaGUgbm9ybWFsIGVudHJ5IHBvaW50LiBGaWx0ZXJzIGBhcnJgIGZvciBtYXRjaGVzIGFnYWluc3QgYHBhdHRlcm5gLlxuLy8gSXQgcmV0dXJucyBhbiBhcnJheSB3aXRoIG1hdGNoaW5nIHZhbHVlcyBvZiB0aGUgdHlwZTpcbi8vXG4vLyAgICAgW3tcbi8vICAgICAgICAgc3RyaW5nOiAgICc8Yj5sYWgnIC8vIFRoZSByZW5kZXJlZCBzdHJpbmdcbi8vICAgICAgICwgaW5kZXg6ICAgIDIgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgICAgLCBvcmlnaW5hbDogJ2JsYWgnICAgLy8gVGhlIG9yaWdpbmFsIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICB9XVxuLy9cbi8vIGBvcHRzYCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBiYWcuIERldGFpbHM6XG4vL1xuLy8gICAgb3B0cyA9IHtcbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGJlZm9yZSBhIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAgIHByZTogICAgICc8Yj4nXG4vL1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYWZ0ZXIgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICwgcG9zdDogICAgJzwvYj4nXG4vL1xuLy8gICAgICAgIC8vIE9wdGlvbmFsIGZ1bmN0aW9uLiBJbnB1dCBpcyBhbiBlbnRyeSBpbiB0aGUgZ2l2ZW4gYXJyYCxcbi8vICAgICAgICAvLyBvdXRwdXQgc2hvdWxkIGJlIHRoZSBzdHJpbmcgdG8gdGVzdCBgcGF0dGVybmAgYWdhaW5zdC5cbi8vICAgICAgICAvLyBJbiB0aGlzIGV4YW1wbGUsIGlmIGBhcnIgPSBbe2NyeWluZzogJ2tvYWxhJ31dYCB3ZSB3b3VsZCByZXR1cm5cbi8vICAgICAgICAvLyAna29hbGEnLlxuLy8gICAgICAsIGV4dHJhY3Q6IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnLmNyeWluZzsgfVxuLy8gICAgfVxuZnV6enkuZmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuICByZXR1cm4gYXJyXG4gICAgLnJlZHVjZShmdW5jdGlvbihwcmV2LCBlbGVtZW50LCBpZHgsIGFycikge1xuICAgICAgdmFyIHN0ciA9IGVsZW1lbnQ7XG4gICAgICBpZihvcHRzLmV4dHJhY3QpIHtcbiAgICAgICAgc3RyID0gb3B0cy5leHRyYWN0KGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbmRlcmVkID0gZnV6enkubWF0Y2gocGF0dGVybiwgc3RyLCBvcHRzKTtcbiAgICAgIGlmKHJlbmRlcmVkICE9IG51bGwpIHtcbiAgICAgICAgcHJldltwcmV2Lmxlbmd0aF0gPSB7XG4gICAgICAgICAgICBzdHJpbmc6IHJlbmRlcmVkLnJlbmRlcmVkXG4gICAgICAgICAgLCBzY29yZTogcmVuZGVyZWQuc2NvcmVcbiAgICAgICAgICAsIGluZGV4OiBpZHhcbiAgICAgICAgICAsIG9yaWdpbmFsOiBlbGVtZW50XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJldjtcbiAgICB9LCBbXSlcblxuICAgIC8vIFNvcnQgYnkgc2NvcmUuIEJyb3dzZXJzIGFyZSBpbmNvbnNpc3RlbnQgd3J0IHN0YWJsZS91bnN0YWJsZVxuICAgIC8vIHNvcnRpbmcsIHNvIGZvcmNlIHN0YWJsZSBieSB1c2luZyB0aGUgaW5kZXggaW4gdGhlIGNhc2Ugb2YgdGllLlxuICAgIC8vIFNlZSBodHRwOi8vb2ZiLm5ldC9+c2V0aG1sL2lzLXNvcnQtc3RhYmxlLmh0bWxcbiAgICAuc29ydChmdW5jdGlvbihhLGIpIHtcbiAgICAgIHZhciBjb21wYXJlID0gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICBpZihjb21wYXJlKSByZXR1cm4gY29tcGFyZTtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcbn07XG5cblxufSgpKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBsZWZ0UGFkO1xuXG52YXIgY2FjaGUgPSBbXG4gICcnLFxuICAnICcsXG4gICcgICcsXG4gICcgICAnLFxuICAnICAgICcsXG4gICcgICAgICcsXG4gICcgICAgICAnLFxuICAnICAgICAgICcsXG4gICcgICAgICAgICcsXG4gICcgICAgICAgICAnXG5dO1xuXG5mdW5jdGlvbiBsZWZ0UGFkIChzdHIsIGxlbiwgY2gpIHtcbiAgLy8gY29udmVydCBgc3RyYCB0byBgc3RyaW5nYFxuICBzdHIgPSBzdHIgKyAnJztcbiAgLy8gYGxlbmAgaXMgdGhlIGBwYWRgJ3MgbGVuZ3RoIG5vd1xuICBsZW4gPSBsZW4gLSBzdHIubGVuZ3RoO1xuICAvLyBkb2Vzbid0IG5lZWQgdG8gcGFkXG4gIGlmIChsZW4gPD0gMCkgcmV0dXJuIHN0cjtcbiAgLy8gYGNoYCBkZWZhdWx0cyB0byBgJyAnYFxuICBpZiAoIWNoICYmIGNoICE9PSAwKSBjaCA9ICcgJztcbiAgLy8gY29udmVydCBgY2hgIHRvIGBzdHJpbmdgXG4gIGNoID0gY2ggKyAnJztcbiAgLy8gY2FjaGUgY29tbW9uIHVzZSBjYXNlc1xuICBpZiAoY2ggPT09ICcgJyAmJiBsZW4gPCAxMCkgcmV0dXJuIGNhY2hlW2xlbl0gKyBzdHI7XG4gIC8vIGBwYWRgIHN0YXJ0cyB3aXRoIGFuIGVtcHR5IHN0cmluZ1xuICB2YXIgcGFkID0gJyc7XG4gIC8vIGxvb3BcbiAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyBhZGQgYGNoYCB0byBgcGFkYCBpZiBgbGVuYCBpcyBvZGRcbiAgICBpZiAobGVuICYgMSkgcGFkICs9IGNoO1xuICAgIC8vIGRldmlkZSBgbGVuYCBieSAyLCBkaXRjaCB0aGUgZnJhY3Rpb25cbiAgICBsZW4gPj49IDE7XG4gICAgLy8gXCJkb3VibGVcIiB0aGUgYGNoYCBzbyB0aGlzIG9wZXJhdGlvbiBjb3VudCBncm93cyBsb2dhcml0aG1pY2FsbHkgb24gYGxlbmBcbiAgICAvLyBlYWNoIHRpbWUgYGNoYCBpcyBcImRvdWJsZWRcIiwgdGhlIGBsZW5gIHdvdWxkIG5lZWQgdG8gYmUgXCJkb3VibGVkXCIgdG9vXG4gICAgLy8gc2ltaWxhciB0byBmaW5kaW5nIGEgdmFsdWUgaW4gYmluYXJ5IHNlYXJjaCB0cmVlLCBoZW5jZSBPKGxvZyhuKSlcbiAgICBpZiAobGVuKSBjaCArPSBjaDtcbiAgICAvLyBgbGVuYCBpcyAwLCBleGl0IHRoZSBsb29wXG4gICAgZWxzZSBicmVhaztcbiAgfVxuICAvLyBwYWQgYHN0cmAhXG4gIHJldHVybiBwYWQgKyBzdHI7XG59XG4iLCJ2YXIgbGVmdFBhZCA9IHJlcXVpcmUoJ2xlZnQtcGFkJylcbnZhciBnZXRXZWVrID0gcmVxdWlyZSgnLi9nZXRXZWVrJylcblxuZnVuY3Rpb24gZ2V0VVJMT2ZVc2VycyAod2Vla09mZnNldCwgdHlwZSwgaWQpIHtcbiAgcmV0dXJuIGAvLyR7d2luZG93LmxvY2F0aW9uLmhvc3R9L21lZXRpbmdwb2ludFByb3h5L1Jvb3N0ZXJzLUFMJTJGZG9jJTJGZGFncm9vc3RlcnMlMkZgICtcbiAgICAgIGAkeyhnZXRXZWVrKCkgKyB3ZWVrT2Zmc2V0KX0lMkYke3R5cGV9JTJGJHt0eXBlfSR7bGVmdFBhZChpZCwgNSwgJzAnKX0uaHRtYFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFVSTE9mVXNlcnNcbiIsIi8vIGNvcGllZCBmcm9tIGh0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy9kYWdyb29zdGVycy91bnRpc3NjcmlwdHMuanMsXG4vLyB3ZXJlIHVzaW5nIHRoZSBzYW1lIGNvZGUgYXMgdGhleSBkbyB0byBiZSBzdXJlIHRoYXQgd2UgYWx3YXlzIGdldCB0aGUgc2FtZVxuLy8gd2VlayBudW1iZXIuXG5mdW5jdGlvbiBnZXRXZWVrICgpIHtcbiAgLy8gQ3JlYXRlIGEgY29weSBvZiB0aGlzIGRhdGUgb2JqZWN0XG4gIGNvbnN0IHRhcmdldCA9IG5ldyBEYXRlKClcblxuICAvLyBJU08gd2VlayBkYXRlIHdlZWtzIHN0YXJ0IG9uIG1vbmRheVxuICAvLyBzbyBjb3JyZWN0IHRoZSBkYXkgbnVtYmVyXG4gIGNvbnN0IGRheU5yID0gKHRhcmdldC5nZXREYXkoKSArIDYpICUgN1xuXG4gIC8vIElTTyA4NjAxIHN0YXRlcyB0aGF0IHdlZWsgMSBpcyB0aGUgd2Vla1xuICAvLyB3aXRoIHRoZSBmaXJzdCB0aHVyc2RheSBvZiB0aGF0IHllYXIuXG4gIC8vIFNldCB0aGUgdGFyZ2V0IGRhdGUgdG8gdGhlIHRodXJzZGF5IGluIHRoZSB0YXJnZXQgd2Vla1xuICB0YXJnZXQuc2V0RGF0ZSh0YXJnZXQuZ2V0RGF0ZSgpIC0gZGF5TnIgKyAzKVxuXG4gIC8vIFN0b3JlIHRoZSBtaWxsaXNlY29uZCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGRhdGVcbiAgY29uc3QgZmlyc3RUaHVyc2RheSA9IHRhcmdldC52YWx1ZU9mKClcblxuICAvLyBTZXQgdGhlIHRhcmdldCB0byB0aGUgZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXJcbiAgLy8gRmlyc3Qgc2V0IHRoZSB0YXJnZXQgdG8gamFudWFyeSBmaXJzdFxuICB0YXJnZXQuc2V0TW9udGgoMCwgMSlcbiAgLy8gTm90IGEgdGh1cnNkYXk/IENvcnJlY3QgdGhlIGRhdGUgdG8gdGhlIG5leHQgdGh1cnNkYXlcbiAgaWYgKHRhcmdldC5nZXREYXkoKSAhPT0gNCkge1xuICAgIHRhcmdldC5zZXRNb250aCgwLCAxICsgKCg0IC0gdGFyZ2V0LmdldERheSgpKSArIDcpICUgNylcbiAgfVxuXG4gIC8vIFRoZSB3ZWVrbnVtYmVyIGlzIHRoZSBudW1iZXIgb2Ygd2Vla3MgYmV0d2VlbiB0aGVcbiAgLy8gZmlyc3QgdGh1cnNkYXkgb2YgdGhlIHllYXIgYW5kIHRoZSB0aHVyc2RheSBpbiB0aGUgdGFyZ2V0IHdlZWtcbiAgcmV0dXJuIDEgKyBNYXRoLmNlaWwoKGZpcnN0VGh1cnNkYXkgLSB0YXJnZXQpIC8gNjA0ODAwMDAwKSAvLyA2MDQ4MDAwMDAgPSA3ICogMjQgKiAzNjAwICogMTAwMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFdlZWtcbiIsIi8qIGdsb2JhbCBnYSAqL1xuXG5yZXF1aXJlKCdmbGV4aWJpbGl0eScpXG5cbmNvbnN0IGZ1enp5ID0gcmVxdWlyZSgnZnV6enknKVxuLy8gY29uc3QgZ2V0VXNlcnMgPSByZXF1aXJlKCcuL2dldFVzZXJzJylcbmNvbnN0IGdldFVSTE9mVXNlciA9IHJlcXVpcmUoJy4vZ2V0VVJMT2ZVc2VyJylcbmNvbnN0IHJlbW92ZURpYWNyaXRpY3MgPSByZXF1aXJlKCdkaWFjcml0aWNzJykucmVtb3ZlXG5jb25zdCBnZXRXZWVrID0gcmVxdWlyZSgnLi9nZXRXZWVrJylcblxuY29uc3Qgc2VhcmNoTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKVxuY29uc3QgaW5wdXROb2RlID0gc2VhcmNoTm9kZS5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpXG5jb25zdCBhdXRvY29tcGxldGVOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG5jb25zdCBzY2hlZHVsZUlmcmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG5jb25zdCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpWzBdXG5jb25zdCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpWzFdXG5jb25zdCBjdXJyZW50V2Vla05vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCcpXG5jb25zdCBmYXZOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhdicpXG5cbmxldCBzZWxlY3RlZFJlc3VsdCA9IC0xXG5sZXQgc2VsZWN0ZWRVc2VyXG5sZXQgcmVzdWx0c1xubGV0IG9mZnNldCA9IDBcblxuZnVuY3Rpb24gZ2V0VXNlcnMgKCkge1xuICBjb25zdCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkYXRhJylcbiAgICAucXVlcnlTZWxlY3RvckFsbCgnLmRhdGEtdXNlcicpXG4gIGNvbnN0IGVsZW1lbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZXMpXG4gIGNvbnN0IHVzZXJzID0gZWxlbWVudHMubWFwKHVzZXJOb2RlID0+IHtcbiAgICBjb25zdCB0eXBlID0gdXNlck5vZGUucXVlcnlTZWxlY3RvcignLmRhdGEtdHlwZScpLnRleHRDb250ZW50XG4gICAgY29uc3QgdmFsdWUgPSB1c2VyTm9kZS5xdWVyeVNlbGVjdG9yKCcuZGF0YS12YWx1ZScpLnRleHRDb250ZW50XG4gICAgY29uc3QgaW5kZXggPSBOdW1iZXIodXNlck5vZGUucXVlcnlTZWxlY3RvcignLmRhdGEtaW5kZXgnKS50ZXh0Q29udGVudClcbiAgICBjb25zdCBvdGhlciA9IHVzZXJOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5kYXRhLW90aGVyJykudGV4dENvbnRlbnRcbiAgICBjb25zdCBpc0lEID0gdXNlck5vZGUucXVlcnlTZWxlY3RvcignLmRhdGEtaXNJRCcpLnRleHRDb250ZW50ID09PSAndHJ1ZSdcbiAgICByZXR1cm4geyB0eXBlLCB2YWx1ZSwgaW5kZXgsIG90aGVyLCBpc0lEIH1cbiAgfSlcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0YScpLm91dGVySFRNTCA9ICcnXG5cbiAgcmV0dXJuIHVzZXJzXG59XG5cbmNvbnN0IHVzZXJzID0gZ2V0VXNlcnMoKVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50RmF2ICgpIHtcbiAgaWYgKCF3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpKSByZXR1cm5cbiAgY29uc3QgZmF2Q29kZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZmF2Jykuc3BsaXQoJzonKVxuICBjb25zdCBmYXYgPSB1c2Vycy5maWx0ZXIodXNlciA9PiB1c2VyLnR5cGUgPT09IGZhdkNvZGVbMF0gJiYgdXNlci5pbmRleCA9PT0gTnVtYmVyKGZhdkNvZGVbMV0pKVxuICByZXR1cm4gZmF2W2Zhdi5sZW5ndGggLSAxXVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VGYXYgKGlzRmF2KSB7XG4gIGlmICghc2VsZWN0ZWRVc2VyKSByZXR1cm5cbiAgaWYgKGlzRmF2KSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmYXYnLCBzZWxlY3RlZFVzZXIudHlwZSArICc6JyArIHNlbGVjdGVkVXNlci5pbmRleClcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG4gIH1cbiAgdXBkYXRlRmF2Tm9kZSgpXG59XG5cbmZ1bmN0aW9uIHVzZXJzRXF1YWwgKHVzZXIxLCB1c2VyMikge1xuICBpZiAodXNlcjEgPT0gbnVsbCB8fCB1c2VyMiA9PSBudWxsKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHVzZXIxLnR5cGUgPT09IHVzZXIyLnR5cGUgJiYgdXNlcjEuaW5kZXggPT09IHVzZXIyLmluZGV4XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUZhdk5vZGUgKCkge1xuICBpZiAodXNlcnNFcXVhbChnZXRDdXJyZW50RmF2KCksIHNlbGVjdGVkVXNlcikpIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODM4OydcbiAgfSBlbHNlIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdlZWtUZXh0ICgpIHtcbiAgaWYgKG9mZnNldCA9PT0gMCkgY3VycmVudFdlZWtOb2RlLmlubmVySFRNTCA9IGBXZWVrICR7Z2V0V2VlaygpICsgb2Zmc2V0fWBcbiAgZWxzZSBjdXJyZW50V2Vla05vZGUuaW5uZXJIVE1MID0gYDxzdHJvbmc+V2VlayAke2dldFdlZWsoKSArIG9mZnNldH08L3N0cm9uZz5gXG59XG5cbnVwZGF0ZVdlZWtUZXh0KClcblxuc2VhcmNoTm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgaWYgKHJlc3VsdHMgJiYgKGUua2V5ID09PSAnQXJyb3dEb3duJyB8fCBlLmtleSA9PT0gJ0Fycm93VXAnKSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3RlZCcpKSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0ZWQnKS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG5cbiAgICBjb25zdCBjaGFuZ2UgPSBlLmtleSA9PT0gJ0Fycm93RG93bicgPyAxIDogLTFcbiAgICBzZWxlY3RlZFJlc3VsdCArPSBjaGFuZ2VcbiAgICBpZiAoc2VsZWN0ZWRSZXN1bHQgPCAtMSkgc2VsZWN0ZWRSZXN1bHQgPSByZXN1bHRzLmxlbmd0aCAtIDFcbiAgICBlbHNlIGlmIChzZWxlY3RlZFJlc3VsdCA+IHJlc3VsdHMubGVuZ3RoIC0gMSkgc2VsZWN0ZWRSZXN1bHQgPSAtMVxuXG4gICAgaWYgKHNlbGVjdGVkUmVzdWx0ICE9PSAtMSkgYXV0b2NvbXBsZXRlTm9kZS5jaGlsZHJlbltzZWxlY3RlZFJlc3VsdF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgYXV0b2NvbXBsZXRlTm9kZS5pbm5lckhUTUwgPSAnJ1xuICBpZiAoaW5wdXROb2RlLnZhbHVlLnRyaW0oKSA9PT0gJycpIHJldHVyblxuXG4gIHNlbGVjdGVkUmVzdWx0ID0gLTFcbiAgcmVzdWx0cyA9IGZ1enp5LmZpbHRlcihyZW1vdmVEaWFjcml0aWNzKGlucHV0Tm9kZS52YWx1ZSksIHVzZXJzLCB7XG4gICAgZXh0cmFjdDogZnVuY3Rpb24gKGVsKSB7IHJldHVybiByZW1vdmVEaWFjcml0aWNzKGVsLnZhbHVlKSB9XG4gIH0pLnNsaWNlKDAsIDcpXG5cbiAgaWYgKGlucHV0Tm9kZS52YWx1ZSA9PT0gJ0Zyb20gVGhlIERlcHRocycpIHtcbiAgICByZXN1bHRzLnB1c2goe29yaWdpbmFsOiB7dmFsdWU6ICdMYWF0IGRpdCBuaWV0IGFhbiBzYW0gemllbiDwn5iJLicsIG90aGVyOiAnJ319KVxuICB9IGVsc2UgaWYgKC9eKD86bWVuZWVyfG1ldnJvdXcpIFxcdysgZG9jZW50JC9pLnRlc3QoaW5wdXROb2RlLnZhbHVlKSkge1xuICAgIHJlc3VsdHMucHVzaCh7b3JpZ2luYWw6IHt2YWx1ZTogJ0NBVklBIScsIG90aGVyOiAnJywgdHlwZTogJ3MnLCBpbmRleDogMTczfX0pXG4gIH1cblxuICBjb25zb2xlLmxvZyhyZXN1bHRzWzBdKVxuXG4gIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgY29uc3QgcmVzdWx0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICByZXN1bHROb2RlLmlubmVySFRNTCA9IGAke3Jlc3VsdC5vcmlnaW5hbC52YWx1ZX08c3BhbiBjbGFzcz1cIm90aGVyXCI+JHtyZXN1bHQub3JpZ2luYWwub3RoZXJ9PC9zcGFuPmBcbiAgICBhdXRvY29tcGxldGVOb2RlLmFwcGVuZENoaWxkKHJlc3VsdE5vZGUpXG4gIH0pXG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHN1Ym1pdEZvcm0pXG5cbmZ1bmN0aW9uIHN1Ym1pdEZvcm0gKGUpIHtcbiAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuICBpZiAocmVzdWx0cyAhPSBudWxsKSB7XG4gICAgY29uc3QgaW5kZXhJblJlc3VsdCA9IHNlbGVjdGVkUmVzdWx0ID09PSAtMSA/IDAgOiBzZWxlY3RlZFJlc3VsdFxuICAgIHNlbGVjdGVkVXNlciA9IHVzZXJzW3Jlc3VsdHNbaW5kZXhJblJlc3VsdF0uaW5kZXhdXG4gIH1cbiAgaWYgKHNlbGVjdGVkVXNlciA9PSBudWxsKSByZXR1cm5cblxuICB1cGRhdGVGYXZOb2RlKClcblxuICBpbnB1dE5vZGUudmFsdWUgPSBzZWxlY3RlZFVzZXIudmFsdWVcbiAgYXV0b2NvbXBsZXRlTm9kZS5pbm5lckhUTUwgPSAnJ1xuXG4gIGlucHV0Tm9kZS5ibHVyKClcblxuICBzY2hlZHVsZUlmcmFtZS5zcmMgPSBnZXRVUkxPZlVzZXIob2Zmc2V0LCBzZWxlY3RlZFVzZXIudHlwZSwgc2VsZWN0ZWRVc2VyLmluZGV4ICsgMSlcblxuICBjb25zdCBoaXRUeXBlID0gJ2V2ZW50J1xuICBsZXQgZXZlbnRDYXRlZ29yeVxuICBzd2l0Y2ggKHNlbGVjdGVkVXNlci50eXBlKSB7XG4gICAgY2FzZSAnYyc6XG4gICAgICBldmVudENhdGVnb3J5ID0gJ0NsYXNzJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICd0JzpcbiAgICAgIGV2ZW50Q2F0ZWdvcnkgPSAnVGVhY2hlcidcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncic6XG4gICAgICBldmVudENhdGVnb3J5ID0gJ1Jvb20nXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3MnOlxuICAgICAgZXZlbnRDYXRlZ29yeSA9ICdTdHVkZW50J1xuICAgICAgYnJlYWtcbiAgfVxuICBsZXQgZXZlbnRBY3Rpb25cbiAgaWYgKHNlbGVjdGVkVXNlci5pc0lEKSB7XG4gICAgZXZlbnRBY3Rpb24gPSAnYnkgaWQnXG4gIH0gZWxzZSB7XG4gICAgZXZlbnRBY3Rpb24gPSAnYnkgbmFtZSdcbiAgfVxuICBjb25zdCBldmVudExhYmVsID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG5cbiAgZ2EoZnVuY3Rpb24gKCkge1xuICAgIGdhKCdzZW5kJywgeyBoaXRUeXBlLCBldmVudENhdGVnb3J5LCBldmVudEFjdGlvbiwgZXZlbnRMYWJlbCB9KVxuICB9KVxufVxuXG5hdXRvY29tcGxldGVOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgaWYgKGF1dG9jb21wbGV0ZU5vZGUuY29udGFpbnMoZS50YXJnZXQpKSB7XG4gICAgc2VsZWN0ZWRSZXN1bHQgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuY2hpbGROb2RlcywgZS50YXJnZXQpXG4gICAgc3VibWl0Rm9ybSgpXG4gIH1cbn0pXG5cbnByZXZCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIG9mZnNldC0tXG4gIHVwZGF0ZVdlZWtUZXh0KClcbiAgc3VibWl0Rm9ybSgpXG59KVxuXG5uZXh0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBvZmZzZXQrK1xuICB1cGRhdGVXZWVrVGV4dCgpXG4gIHN1Ym1pdEZvcm0oKVxufSlcblxuaW5wdXROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBpbnB1dE5vZGUuc2VsZWN0KClcbn0pXG5cbmlucHV0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgZnVuY3Rpb24gKCkge1xuICBjb25zdCBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgaWYgKCFpc1NhZmFyaSkge1xuICAgIGlucHV0Tm9kZS5zZWxlY3Rpb25TdGFydCA9IGlucHV0Tm9kZS5zZWxlY3Rpb25FbmQgPSAtMVxuICB9XG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmdW5jdGlvbiAoZSkge1xuICBhdXRvY29tcGxldGVOb2RlLmlubmVySFRNTCA9ICcnXG59KVxuXG5mYXZOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBpZiAodXNlcnNFcXVhbChnZXRDdXJyZW50RmF2KCksIHNlbGVjdGVkVXNlcikpIHtcbiAgICBjaGFuZ2VGYXYoZmFsc2UpXG4gIH0gZWxzZSB7XG4gICAgY2hhbmdlRmF2KHRydWUpXG4gIH1cbn0pXG5cbmNvbnN0IGN1cnJlbnRGYXYgPSBnZXRDdXJyZW50RmF2KClcblxuaWYgKGN1cnJlbnRGYXYpIHtcbiAgc2VsZWN0ZWRVc2VyID0gY3VycmVudEZhdlxuICBpbnB1dE5vZGUudmFsdWUgPSBzZWxlY3RlZFVzZXIudmFsdWVcbiAgc2NoZWR1bGVJZnJhbWUuc3JjID0gZ2V0VVJMT2ZVc2VyKG9mZnNldCwgc2VsZWN0ZWRVc2VyLnR5cGUsIHNlbGVjdGVkVXNlci5pbmRleCArIDEpXG4gIHVwZGF0ZUZhdk5vZGUoKVxufVxuIl19
