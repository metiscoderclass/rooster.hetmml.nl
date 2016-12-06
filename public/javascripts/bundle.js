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
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
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
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
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
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
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
/* This program is free software. It comes without any warranty, to
     * the extent permitted by applicable law. You can redistribute it
     * and/or modify it under the terms of the Do What The Fuck You Want
     * To Public License, Version 2, as published by Sam Hocevar. See
     * http://www.wtfpl.net/ for more details. */
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
    // divide `len` by 2, ditch the remainder
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

var sinterklaas = function sinterklaas() {
  console.log('sinterklaas easter egg activated');
  var searchNode = document.querySelector('#search');
  var inputNode = searchNode.querySelector('input[type="text"]');
  var autocompleteNode = document.querySelector('.autocomplete');
  var autocomplete = false;
  var lyrics = [[{ woord: 'Hoor ', time: 0 }, { woord: 'wie ', time: 0.3 }, { woord: 'klopt ', time: 0.6 }, { woord: 'daar ', time: 0.9 }, { woord: 'kind', time: 1.2 }, { woord: '\'ren', time: 1.5 }], [{ woord: 'Hoor ', time: 1.8 }, { woord: 'wie ', time: 2.1 }, { woord: 'klopt ', time: 2.5 }, { woord: 'daar ', time: 2.8 }, { woord: 'kind', time: 3.1 }, { woord: '\'ren', time: 3.4 }], [{ woord: 'Hoor ', time: 3.7 }, { woord: 'wie ', time: 4 }, { woord: 'tikt ', time: 4.3 }, { woord: 'daar ', time: 4.6 }, { woord: 'zacht', time: 4.8 }, { woord: 'jes ', time: 5.3 }, { woord: 'tegen ', time: 5.5 }, { woord: '\'t ', time: 6.1 }, { woord: 'raam ', time: 6.2 }]];

  var originalValue = inputNode.value;

  inputNode.value = '';
  inputNode.placeholder = '';

  lyrics.forEach(function (row, rowIndex) {
    row.forEach(function (word, wordIndex) {
      setTimeout(function () {
        if (wordIndex === 0) inputNode.placeholder = '';
        inputNode.placeholder += word.woord;
      }, word.time * 1000);
      if (lyrics.length === rowIndex + 1 && lyrics[rowIndex].length === wordIndex + 1) {
        setTimeout(function () {
          if (inputNode.value === '') {
            inputNode.value = originalValue;
          }
          inputNode.placeholder = 'Zoeken';
          autocomplete = true;
        }, word.time * 1000 + 1000);
      }
    });
  });

  inputNode.addEventListener('focus', function () {
    if (!autocomplete) return;

    autocompleteNode.innerHTML = '';

    var autocompleteLyrics = ['\'t Is een vreemd\'ling zeker,', 'die verdwaalt is zeker.', '\'k Zal eens even vragen naar zijn naam:'];

    autocompleteLyrics.forEach(function (row) {
      var resultNode = document.createElement('li');
      resultNode.innerHTML = row;
      autocompleteNode.appendChild(resultNode);
    });
  });

  inputNode.addEventListener('input', function () {
    if (!autocomplete) return;
    if (inputNode.value.toLowerCase() === 'sint nicolaas' || inputNode.value.toLowerCase() === 'sintnicolaas' || inputNode.value.toLowerCase() === 'sint nikolaas' || inputNode.value.toLowerCase() === 'sintnikolaas') {
      inputNode.value = '';
      window.location.href = 'https://www.youtube-nocookie.com/embed/jsOiKJ3kKXM?start=30';
    }
  });
};

module.exports = { sinterklaas: sinterklaas };

},{}],6:[function(require,module,exports){
'use strict';

var leftPad = require('left-pad');
var getWeek = require('./getWeek');

function getURLOfUsers(weekOffset, type, id) {
  return '//' + window.location.host + '/meetingpointProxy/Roosters-AL%2Fdoc%2Fdagroosters%2F' + (getWeek() + weekOffset + '%2F' + type + '%2F' + type + leftPad(id, 5, '0') + '.htm');
}

module.exports = getURLOfUsers;

},{"./getWeek":7,"left-pad":4}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

/* global ga FLAGS USERS */

require('flexibility');

var fuzzy = require('fuzzy');
// const getUsers = require('./getUsers')
var getURLOfUser = require('./getURLOfUser');
var removeDiacritics = require('diacritics').remove;
var getWeek = require('./getWeek');
var easterEggs = require('./easterEggs');

var searchNode = document.querySelector('#search');
var inputNode = searchNode.querySelector('input[type="text"]');
var autocompleteNode = document.querySelector('.autocomplete');
var scheduleIframe = document.querySelector('#schedule');
var prevButton = document.querySelectorAll('input[type="button"]')[0];
var nextButton = document.querySelectorAll('input[type="button"]')[1];
var currentWeekNode = document.querySelector('.current');
var favNode = document.querySelector('.fav');

if (FLAGS.indexOf('NO_FEATURE_DETECT') === -1) {
  if (document.querySelector('#schedule').getClientRects()[0].bottom !== document.body.getClientRects()[0].bottom) {
    window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/';
  } else {
    window.onerror = function () {
      window.location = 'http://www.meetingpointmco.nl/Roosters-AL/doc/';
    };
  }
} else {
  console.log('feature detection is OFF');
}

var selectedResult = -1;
var selectedUser = void 0;
var results = [];
var offset = 0;

function getCurrentFav() {
  if (!window.localStorage.getItem('fav')) return;
  var favCode = window.localStorage.getItem('fav').split(':');
  var fav = USERS.filter(function (user) {
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
  searchNode.className = '';
  autocompleteNode.innerHTML = '';
  if (inputNode.value.trim() === '') return;

  selectedResult = -1;
  results = fuzzy.filter(removeDiacritics(inputNode.value), USERS, {
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
    selectedUser = USERS[results[indexInResult].index];
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
  (function () {
    selectedUser = currentFav;
    inputNode.value = selectedUser.value;
    scheduleIframe.src = getURLOfUser(offset, selectedUser.type, selectedUser.index + 1);
    updateFavNode();

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
      ga('send', { hitType: 'event', eventCategory: 'search fav', eventAction: eventAction, eventLabel: eventLabel });
    });
  })();
} else if (inputNode.value === '') {
  searchNode.className = 'no-input';
  inputNode.focus();
}

document.body.style.opacity = '1';

window.easterEggs = easterEggs;

},{"./easterEggs":5,"./getURLOfUser":6,"./getWeek":7,"diacritics":1,"flexibility":2,"fuzzy":3}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZGlhY3JpdGljcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGV4aWJpbGl0eS9mbGV4aWJpbGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9mdXp6eS9saWIvZnV6enkuanMiLCJub2RlX21vZHVsZXMvbGVmdC1wYWQvaW5kZXguanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZWFzdGVyRWdncy5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9nZXRVUkxPZlVzZXIuanMiLCJwdWJsaWMvamF2YXNjcmlwdHMvZ2V0V2Vlay5qcyIsInB1YmxpYy9qYXZhc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDelRBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FB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ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5yZW1vdmUgPSByZW1vdmVEaWFjcml0aWNzO1xuXG52YXIgcmVwbGFjZW1lbnRMaXN0ID0gW1xuICB7XG4gICAgYmFzZTogJyAnLFxuICAgIGNoYXJzOiBcIlxcdTAwQTBcIixcbiAgfSwge1xuICAgIGJhc2U6ICcwJyxcbiAgICBjaGFyczogXCJcXHUwN0MwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQScsXG4gICAgY2hhcnM6IFwiXFx1MjRCNlxcdUZGMjFcXHUwMEMwXFx1MDBDMVxcdTAwQzJcXHUxRUE2XFx1MUVBNFxcdTFFQUFcXHUxRUE4XFx1MDBDM1xcdTAxMDBcXHUwMTAyXFx1MUVCMFxcdTFFQUVcXHUxRUI0XFx1MUVCMlxcdTAyMjZcXHUwMUUwXFx1MDBDNFxcdTAxREVcXHUxRUEyXFx1MDBDNVxcdTAxRkFcXHUwMUNEXFx1MDIwMFxcdTAyMDJcXHUxRUEwXFx1MUVBQ1xcdTFFQjZcXHUxRTAwXFx1MDEwNFxcdTAyM0FcXHUyQzZGXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQUEnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBRScsXG4gICAgY2hhcnM6IFwiXFx1MDBDNlxcdTAxRkNcXHUwMUUyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQU8nLFxuICAgIGNoYXJzOiBcIlxcdUE3MzRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdBVScsXG4gICAgY2hhcnM6IFwiXFx1QTczNlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FWJyxcbiAgICBjaGFyczogXCJcXHVBNzM4XFx1QTczQVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0FZJyxcbiAgICBjaGFyczogXCJcXHVBNzNDXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnQicsXG4gICAgY2hhcnM6IFwiXFx1MjRCN1xcdUZGMjJcXHUxRTAyXFx1MUUwNFxcdTFFMDZcXHUwMjQzXFx1MDE4MVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0MnLFxuICAgIGNoYXJzOiBcIlxcdTI0YjhcXHVmZjIzXFx1QTczRVxcdTFFMDhcXHUwMTA2XFx1MDA0M1xcdTAxMDhcXHUwMTBBXFx1MDEwQ1xcdTAwQzdcXHUwMTg3XFx1MDIzQlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0QnLFxuICAgIGNoYXJzOiBcIlxcdTI0QjlcXHVGRjI0XFx1MUUwQVxcdTAxMEVcXHUxRTBDXFx1MUUxMFxcdTFFMTJcXHUxRTBFXFx1MDExMFxcdTAxOEFcXHUwMTg5XFx1MUQwNVxcdUE3NzlcIixcbiAgfSwge1xuICAgIGJhc2U6ICdEaCcsXG4gICAgY2hhcnM6IFwiXFx1MDBEMFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0RaJyxcbiAgICBjaGFyczogXCJcXHUwMUYxXFx1MDFDNFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0R6JyxcbiAgICBjaGFyczogXCJcXHUwMUYyXFx1MDFDNVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0UnLFxuICAgIGNoYXJzOiBcIlxcdTAyNUJcXHUyNEJBXFx1RkYyNVxcdTAwQzhcXHUwMEM5XFx1MDBDQVxcdTFFQzBcXHUxRUJFXFx1MUVDNFxcdTFFQzJcXHUxRUJDXFx1MDExMlxcdTFFMTRcXHUxRTE2XFx1MDExNFxcdTAxMTZcXHUwMENCXFx1MUVCQVxcdTAxMUFcXHUwMjA0XFx1MDIwNlxcdTFFQjhcXHUxRUM2XFx1MDIyOFxcdTFFMUNcXHUwMTE4XFx1MUUxOFxcdTFFMUFcXHUwMTkwXFx1MDE4RVxcdTFEMDdcIixcbiAgfSwge1xuICAgIGJhc2U6ICdGJyxcbiAgICBjaGFyczogXCJcXHVBNzdDXFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JcIixcbiAgfSwge1xuICAgIGJhc2U6ICdHJyxcbiAgICBjaGFyczogXCJcXHUyNEJDXFx1RkYyN1xcdTAxRjRcXHUwMTFDXFx1MUUyMFxcdTAxMUVcXHUwMTIwXFx1MDFFNlxcdTAxMjJcXHUwMUU0XFx1MDE5M1xcdUE3QTBcXHVBNzdEXFx1QTc3RVxcdTAyNjJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdIJyxcbiAgICBjaGFyczogXCJcXHUyNEJEXFx1RkYyOFxcdTAxMjRcXHUxRTIyXFx1MUUyNlxcdTAyMUVcXHUxRTI0XFx1MUUyOFxcdTFFMkFcXHUwMTI2XFx1MkM2N1xcdTJDNzVcXHVBNzhEXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnSScsXG4gICAgY2hhcnM6IFwiXFx1MjRCRVxcdUZGMjlcXHhDQ1xceENEXFx4Q0VcXHUwMTI4XFx1MDEyQVxcdTAxMkNcXHUwMTMwXFx4Q0ZcXHUxRTJFXFx1MUVDOFxcdTAxQ0ZcXHUwMjA4XFx1MDIwQVxcdTFFQ0FcXHUwMTJFXFx1MUUyQ1xcdTAxOTdcIixcbiAgfSwge1xuICAgIGJhc2U6ICdKJyxcbiAgICBjaGFyczogXCJcXHUyNEJGXFx1RkYyQVxcdTAxMzRcXHUwMjQ4XFx1MDIzN1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ0snLFxuICAgIGNoYXJzOiBcIlxcdTI0QzBcXHVGRjJCXFx1MUUzMFxcdTAxRThcXHUxRTMyXFx1MDEzNlxcdTFFMzRcXHUwMTk4XFx1MkM2OVxcdUE3NDBcXHVBNzQyXFx1QTc0NFxcdUE3QTJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdMJyxcbiAgICBjaGFyczogXCJcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ0xKJyxcbiAgICBjaGFyczogXCJcXHUwMUM3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTGonLFxuICAgIGNoYXJzOiBcIlxcdTAxQzhcIixcbiAgfSwge1xuICAgIGJhc2U6ICdNJyxcbiAgICBjaGFyczogXCJcXHUyNEMyXFx1RkYyRFxcdTFFM0VcXHUxRTQwXFx1MUU0MlxcdTJDNkVcXHUwMTlDXFx1MDNGQlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ04nLFxuICAgIGNoYXJzOiBcIlxcdUE3QTRcXHUwMjIwXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xceEQxXFx1MUU0NFxcdTAxNDdcXHUxRTQ2XFx1MDE0NVxcdTFFNEFcXHUxRTQ4XFx1MDE5RFxcdUE3OTBcXHUxRDBFXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnTkonLFxuICAgIGNoYXJzOiBcIlxcdTAxQ0FcIixcbiAgfSwge1xuICAgIGJhc2U6ICdOaicsXG4gICAgY2hhcnM6IFwiXFx1MDFDQlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ08nLFxuICAgIGNoYXJzOiBcIlxcdTI0QzRcXHVGRjJGXFx4RDJcXHhEM1xceEQ0XFx1MUVEMlxcdTFFRDBcXHUxRUQ2XFx1MUVENFxceEQ1XFx1MUU0Q1xcdTAyMkNcXHUxRTRFXFx1MDE0Q1xcdTFFNTBcXHUxRTUyXFx1MDE0RVxcdTAyMkVcXHUwMjMwXFx4RDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx4RDhcXHUwMUZFXFx1MDE4NlxcdTAxOUZcXHVBNzRBXFx1QTc0Q1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ09FJyxcbiAgICBjaGFyczogXCJcXHUwMTUyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnT0knLFxuICAgIGNoYXJzOiBcIlxcdTAxQTJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdPTycsXG4gICAgY2hhcnM6IFwiXFx1QTc0RVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ09VJyxcbiAgICBjaGFyczogXCJcXHUwMjIyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnUCcsXG4gICAgY2hhcnM6IFwiXFx1MjRDNVxcdUZGMzBcXHUxRTU0XFx1MUU1NlxcdTAxQTRcXHUyQzYzXFx1QTc1MFxcdUE3NTJcXHVBNzU0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnUScsXG4gICAgY2hhcnM6IFwiXFx1MjRDNlxcdUZGMzFcXHVBNzU2XFx1QTc1OFxcdTAyNEFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdSJyxcbiAgICBjaGFyczogXCJcXHUyNEM3XFx1RkYzMlxcdTAxNTRcXHUxRTU4XFx1MDE1OFxcdTAyMTBcXHUwMjEyXFx1MUU1QVxcdTFFNUNcXHUwMTU2XFx1MUU1RVxcdTAyNENcXHUyQzY0XFx1QTc1QVxcdUE3QTZcXHVBNzgyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnUycsXG4gICAgY2hhcnM6IFwiXFx1MjRDOFxcdUZGMzNcXHUxRTlFXFx1MDE1QVxcdTFFNjRcXHUwMTVDXFx1MUU2MFxcdTAxNjBcXHUxRTY2XFx1MUU2MlxcdTFFNjhcXHUwMjE4XFx1MDE1RVxcdTJDN0VcXHVBN0E4XFx1QTc4NFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1QnLFxuICAgIGNoYXJzOiBcIlxcdTI0QzlcXHVGRjM0XFx1MUU2QVxcdTAxNjRcXHUxRTZDXFx1MDIxQVxcdTAxNjJcXHUxRTcwXFx1MUU2RVxcdTAxNjZcXHUwMUFDXFx1MDFBRVxcdTAyM0VcXHVBNzg2XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVGgnLFxuICAgIGNoYXJzOiBcIlxcdTAwREVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdUWicsXG4gICAgY2hhcnM6IFwiXFx1QTcyOFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ1UnLFxuICAgIGNoYXJzOiBcIlxcdTI0Q0FcXHVGRjM1XFx4RDlcXHhEQVxceERCXFx1MDE2OFxcdTFFNzhcXHUwMTZBXFx1MUU3QVxcdTAxNkNcXHhEQ1xcdTAxREJcXHUwMUQ3XFx1MDFENVxcdTAxRDlcXHUxRUU2XFx1MDE2RVxcdTAxNzBcXHUwMUQzXFx1MDIxNFxcdTAyMTZcXHUwMUFGXFx1MUVFQVxcdTFFRThcXHUxRUVFXFx1MUVFQ1xcdTFFRjBcXHUxRUU0XFx1MUU3MlxcdTAxNzJcXHUxRTc2XFx1MUU3NFxcdTAyNDRcIixcbiAgfSwge1xuICAgIGJhc2U6ICdWJyxcbiAgICBjaGFyczogXCJcXHUyNENCXFx1RkYzNlxcdTFFN0NcXHUxRTdFXFx1MDFCMlxcdUE3NUVcXHUwMjQ1XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnVlknLFxuICAgIGNoYXJzOiBcIlxcdUE3NjBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdXJyxcbiAgICBjaGFyczogXCJcXHUyNENDXFx1RkYzN1xcdTFFODBcXHUxRTgyXFx1MDE3NFxcdTFFODZcXHUxRTg0XFx1MUU4OFxcdTJDNzJcIixcbiAgfSwge1xuICAgIGJhc2U6ICdYJyxcbiAgICBjaGFyczogXCJcXHUyNENEXFx1RkYzOFxcdTFFOEFcXHUxRThDXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnWScsXG4gICAgY2hhcnM6IFwiXFx1MjRDRVxcdUZGMzlcXHUxRUYyXFx4RERcXHUwMTc2XFx1MUVGOFxcdTAyMzJcXHUxRThFXFx1MDE3OFxcdTFFRjZcXHUxRUY0XFx1MDFCM1xcdTAyNEVcXHUxRUZFXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnWicsXG4gICAgY2hhcnM6IFwiXFx1MjRDRlxcdUZGM0FcXHUwMTc5XFx1MUU5MFxcdTAxN0JcXHUwMTdEXFx1MUU5MlxcdTFFOTRcXHUwMUI1XFx1MDIyNFxcdTJDN0ZcXHUyQzZCXFx1QTc2MlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2EnLFxuICAgIGNoYXJzOiBcIlxcdTI0RDBcXHVGRjQxXFx1MUU5QVxcdTAwRTBcXHUwMEUxXFx1MDBFMlxcdTFFQTdcXHUxRUE1XFx1MUVBQlxcdTFFQTlcXHUwMEUzXFx1MDEwMVxcdTAxMDNcXHUxRUIxXFx1MUVBRlxcdTFFQjVcXHUxRUIzXFx1MDIyN1xcdTAxRTFcXHUwMEU0XFx1MDFERlxcdTFFQTNcXHUwMEU1XFx1MDFGQlxcdTAxQ0VcXHUwMjAxXFx1MDIwM1xcdTFFQTFcXHUxRUFEXFx1MUVCN1xcdTFFMDFcXHUwMTA1XFx1MkM2NVxcdTAyNTBcXHUwMjUxXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYWEnLFxuICAgIGNoYXJzOiBcIlxcdUE3MzNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhZScsXG4gICAgY2hhcnM6IFwiXFx1MDBFNlxcdTAxRkRcXHUwMUUzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYW8nLFxuICAgIGNoYXJzOiBcIlxcdUE3MzVcIixcbiAgfSwge1xuICAgIGJhc2U6ICdhdScsXG4gICAgY2hhcnM6IFwiXFx1QTczN1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ2F2JyxcbiAgICBjaGFyczogXCJcXHVBNzM5XFx1QTczQlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2F5JyxcbiAgICBjaGFyczogXCJcXHVBNzNEXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYicsXG4gICAgY2hhcnM6IFwiXFx1MjREMVxcdUZGNDJcXHUxRTAzXFx1MUUwNVxcdTFFMDdcXHUwMTgwXFx1MDE4M1xcdTAyNTNcXHUwMTgyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnYycsXG4gICAgY2hhcnM6IFwiXFx1RkY0M1xcdTI0RDJcXHUwMTA3XFx1MDEwOVxcdTAxMEJcXHUwMTBEXFx1MDBFN1xcdTFFMDlcXHUwMTg4XFx1MDIzQ1xcdUE3M0ZcXHUyMTg0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZCcsXG4gICAgY2hhcnM6IFwiXFx1MjREM1xcdUZGNDRcXHUxRTBCXFx1MDEwRlxcdTFFMERcXHUxRTExXFx1MUUxM1xcdTFFMEZcXHUwMTExXFx1MDE4Q1xcdTAyNTZcXHUwMjU3XFx1MDE4QlxcdTEzRTdcXHUwNTAxXFx1QTdBQVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2RoJyxcbiAgICBjaGFyczogXCJcXHUwMEYwXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZHonLFxuICAgIGNoYXJzOiBcIlxcdTAxRjNcXHUwMUM2XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZScsXG4gICAgY2hhcnM6IFwiXFx1MjRENFxcdUZGNDVcXHUwMEU4XFx1MDBFOVxcdTAwRUFcXHUxRUMxXFx1MUVCRlxcdTFFQzVcXHUxRUMzXFx1MUVCRFxcdTAxMTNcXHUxRTE1XFx1MUUxN1xcdTAxMTVcXHUwMTE3XFx1MDBFQlxcdTFFQkJcXHUwMTFCXFx1MDIwNVxcdTAyMDdcXHUxRUI5XFx1MUVDN1xcdTAyMjlcXHUxRTFEXFx1MDExOVxcdTFFMTlcXHUxRTFCXFx1MDI0N1xcdTAxRERcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmJyxcbiAgICBjaGFyczogXCJcXHUyNEQ1XFx1RkY0NlxcdTFFMUZcXHUwMTkyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZmYnLFxuICAgIGNoYXJzOiBcIlxcdUZCMDBcIixcbiAgfSwge1xuICAgIGJhc2U6ICdmaScsXG4gICAgY2hhcnM6IFwiXFx1RkIwMVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2ZsJyxcbiAgICBjaGFyczogXCJcXHVGQjAyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZmZpJyxcbiAgICBjaGFyczogXCJcXHVGQjAzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZmZsJyxcbiAgICBjaGFyczogXCJcXHVGQjA0XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnZycsXG4gICAgY2hhcnM6IFwiXFx1MjRENlxcdUZGNDdcXHUwMUY1XFx1MDExRFxcdTFFMjFcXHUwMTFGXFx1MDEyMVxcdTAxRTdcXHUwMTIzXFx1MDFFNVxcdTAyNjBcXHVBN0ExXFx1QTc3RlxcdTFENzlcIixcbiAgfSwge1xuICAgIGJhc2U6ICdoJyxcbiAgICBjaGFyczogXCJcXHUyNEQ3XFx1RkY0OFxcdTAxMjVcXHUxRTIzXFx1MUUyN1xcdTAyMUZcXHUxRTI1XFx1MUUyOVxcdTFFMkJcXHUxRTk2XFx1MDEyN1xcdTJDNjhcXHUyQzc2XFx1MDI2NVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2h2JyxcbiAgICBjaGFyczogXCJcXHUwMTk1XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnaScsXG4gICAgY2hhcnM6IFwiXFx1MjREOFxcdUZGNDlcXHhFQ1xceEVEXFx4RUVcXHUwMTI5XFx1MDEyQlxcdTAxMkRcXHhFRlxcdTFFMkZcXHUxRUM5XFx1MDFEMFxcdTAyMDlcXHUwMjBCXFx1MUVDQlxcdTAxMkZcXHUxRTJEXFx1MDI2OFxcdTAxMzFcIixcbiAgfSwge1xuICAgIGJhc2U6ICdqJyxcbiAgICBjaGFyczogXCJcXHUyNEQ5XFx1RkY0QVxcdTAxMzVcXHUwMUYwXFx1MDI0OVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ2snLFxuICAgIGNoYXJzOiBcIlxcdTI0REFcXHVGRjRCXFx1MUUzMVxcdTAxRTlcXHUxRTMzXFx1MDEzN1xcdTFFMzVcXHUwMTk5XFx1MkM2QVxcdUE3NDFcXHVBNzQzXFx1QTc0NVxcdUE3QTNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdsJyxcbiAgICBjaGFyczogXCJcXHUyNERCXFx1RkY0Q1xcdTAxNDBcXHUwMTNBXFx1MDEzRVxcdTFFMzdcXHUxRTM5XFx1MDEzQ1xcdTFFM0RcXHUxRTNCXFx1MDE3RlxcdTAxNDJcXHUwMTlBXFx1MDI2QlxcdTJDNjFcXHVBNzQ5XFx1QTc4MVxcdUE3NDdcXHUwMjZEXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbGonLFxuICAgIGNoYXJzOiBcIlxcdTAxQzlcIixcbiAgfSwge1xuICAgIGJhc2U6ICdtJyxcbiAgICBjaGFyczogXCJcXHUyNERDXFx1RkY0RFxcdTFFM0ZcXHUxRTQxXFx1MUU0M1xcdTAyNzFcXHUwMjZGXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbicsXG4gICAgY2hhcnM6IFwiXFx1MjRERFxcdUZGNEVcXHUwMUY5XFx1MDE0NFxceEYxXFx1MUU0NVxcdTAxNDhcXHUxRTQ3XFx1MDE0NlxcdTFFNEJcXHUxRTQ5XFx1MDE5RVxcdTAyNzJcXHUwMTQ5XFx1QTc5MVxcdUE3QTVcXHUwNDNCXFx1MDUwOVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ25qJyxcbiAgICBjaGFyczogXCJcXHUwMUNDXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnbycsXG4gICAgY2hhcnM6IFwiXFx1MjRERVxcdUZGNEZcXHhGMlxceEYzXFx4RjRcXHUxRUQzXFx1MUVEMVxcdTFFRDdcXHUxRUQ1XFx4RjVcXHUxRTREXFx1MDIyRFxcdTFFNEZcXHUwMTREXFx1MUU1MVxcdTFFNTNcXHUwMTRGXFx1MDIyRlxcdTAyMzFcXHhGNlxcdTAyMkJcXHUxRUNGXFx1MDE1MVxcdTAxRDJcXHUwMjBEXFx1MDIwRlxcdTAxQTFcXHUxRUREXFx1MUVEQlxcdTFFRTFcXHUxRURGXFx1MUVFM1xcdTFFQ0RcXHUxRUQ5XFx1MDFFQlxcdTAxRURcXHhGOFxcdTAxRkZcXHVBNzRCXFx1QTc0RFxcdTAyNzVcXHUwMjU0XFx1MUQxMVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ29lJyxcbiAgICBjaGFyczogXCJcXHUwMTUzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnb2knLFxuICAgIGNoYXJzOiBcIlxcdTAxQTNcIixcbiAgfSwge1xuICAgIGJhc2U6ICdvbycsXG4gICAgY2hhcnM6IFwiXFx1QTc0RlwiLFxuICB9LCB7XG4gICAgYmFzZTogJ291JyxcbiAgICBjaGFyczogXCJcXHUwMjIzXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAncCcsXG4gICAgY2hhcnM6IFwiXFx1MjRERlxcdUZGNTBcXHUxRTU1XFx1MUU1N1xcdTAxQTVcXHUxRDdEXFx1QTc1MVxcdUE3NTNcXHVBNzU1XFx1MDNDMVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3EnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTBcXHVGRjUxXFx1MDI0QlxcdUE3NTdcXHVBNzU5XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAncicsXG4gICAgY2hhcnM6IFwiXFx1MjRFMVxcdUZGNTJcXHUwMTU1XFx1MUU1OVxcdTAxNTlcXHUwMjExXFx1MDIxM1xcdTFFNUJcXHUxRTVEXFx1MDE1N1xcdTFFNUZcXHUwMjREXFx1MDI3RFxcdUE3NUJcXHVBN0E3XFx1QTc4M1wiLFxuICB9LCB7XG4gICAgYmFzZTogJ3MnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTJcXHVGRjUzXFx1MDE1QlxcdTFFNjVcXHUwMTVEXFx1MUU2MVxcdTAxNjFcXHUxRTY3XFx1MUU2M1xcdTFFNjlcXHUwMjE5XFx1MDE1RlxcdTAyM0ZcXHVBN0E5XFx1QTc4NVxcdTFFOUJcXHUwMjgyXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAnc3MnLFxuICAgIGNoYXJzOiBcIlxceERGXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndCcsXG4gICAgY2hhcnM6IFwiXFx1MjRFM1xcdUZGNTRcXHUxRTZCXFx1MUU5N1xcdTAxNjVcXHUxRTZEXFx1MDIxQlxcdTAxNjNcXHUxRTcxXFx1MUU2RlxcdTAxNjdcXHUwMUFEXFx1MDI4OFxcdTJDNjZcXHVBNzg3XCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndGgnLFxuICAgIGNoYXJzOiBcIlxcdTAwRkVcIixcbiAgfSwge1xuICAgIGJhc2U6ICd0eicsXG4gICAgY2hhcnM6IFwiXFx1QTcyOVwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3UnLFxuICAgIGNoYXJzOiBcIlxcdTI0RTRcXHVGRjU1XFx4RjlcXHhGQVxceEZCXFx1MDE2OVxcdTFFNzlcXHUwMTZCXFx1MUU3QlxcdTAxNkRcXHhGQ1xcdTAxRENcXHUwMUQ4XFx1MDFENlxcdTAxREFcXHUxRUU3XFx1MDE2RlxcdTAxNzFcXHUwMUQ0XFx1MDIxNVxcdTAyMTdcXHUwMUIwXFx1MUVFQlxcdTFFRTlcXHUxRUVGXFx1MUVFRFxcdTFFRjFcXHUxRUU1XFx1MUU3M1xcdTAxNzNcXHUxRTc3XFx1MUU3NVxcdTAyODlcIixcbiAgfSwge1xuICAgIGJhc2U6ICd2JyxcbiAgICBjaGFyczogXCJcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAndnknLFxuICAgIGNoYXJzOiBcIlxcdUE3NjFcIixcbiAgfSwge1xuICAgIGJhc2U6ICd3JyxcbiAgICBjaGFyczogXCJcXHUyNEU2XFx1RkY1N1xcdTFFODFcXHUxRTgzXFx1MDE3NVxcdTFFODdcXHUxRTg1XFx1MUU5OFxcdTFFODlcXHUyQzczXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAneCcsXG4gICAgY2hhcnM6IFwiXFx1MjRFN1xcdUZGNThcXHUxRThCXFx1MUU4RFwiLFxuICB9LCB7XG4gICAgYmFzZTogJ3knLFxuICAgIGNoYXJzOiBcIlxcdTI0RThcXHVGRjU5XFx1MUVGM1xceEZEXFx1MDE3N1xcdTFFRjlcXHUwMjMzXFx1MUU4RlxceEZGXFx1MUVGN1xcdTFFOTlcXHUxRUY1XFx1MDFCNFxcdTAyNEZcXHUxRUZGXCIsXG4gIH0sIHtcbiAgICBiYXNlOiAneicsXG4gICAgY2hhcnM6IFwiXFx1MjRFOVxcdUZGNUFcXHUwMTdBXFx1MUU5MVxcdTAxN0NcXHUwMTdFXFx1MUU5M1xcdTFFOTVcXHUwMUI2XFx1MDIyNVxcdTAyNDBcXHUyQzZDXFx1QTc2M1wiLFxuICB9XG5dO1xuXG52YXIgZGlhY3JpdGljc01hcCA9IHt9O1xuZm9yICh2YXIgaSA9IDA7IGkgPCByZXBsYWNlbWVudExpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgdmFyIGNoYXJzID0gcmVwbGFjZW1lbnRMaXN0W2ldLmNoYXJzO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IGNoYXJzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgZGlhY3JpdGljc01hcFtjaGFyc1tqXV0gPSByZXBsYWNlbWVudExpc3RbaV0uYmFzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEaWFjcml0aWNzKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1teXFx1MDAwMC1cXHUwMDdlXS9nLCBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGRpYWNyaXRpY3NNYXBbY10gfHwgYztcbiAgfSk7XG59XG4iLCIhZnVuY3Rpb24oZSl7aWYoXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUpbW9kdWxlLmV4cG9ydHM9ZSgpO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShbXSxlKTtlbHNle3ZhciB0O3Q9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGY/c2VsZjp0aGlzLHQuZmxleGliaWxpdHk9ZSgpfX0oZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24gZSh0LHIsbCl7ZnVuY3Rpb24gbihmLGkpe2lmKCFyW2ZdKXtpZighdFtmXSl7dmFyIHM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighaSYmcylyZXR1cm4gcyhmLCEwKTtpZihvKXJldHVybiBvKGYsITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrZitcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIGM9cltmXT17ZXhwb3J0czp7fX07dFtmXVswXS5jYWxsKGMuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgcj10W2ZdWzFdW2VdO3JldHVybiBuKHI/cjplKX0sYyxjLmV4cG9ydHMsZSx0LHIsbCl9cmV0dXJuIHJbZl0uZXhwb3J0c31mb3IodmFyIG89XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxmPTA7ZjxsLmxlbmd0aDtmKyspbihsW2ZdKTtyZXR1cm4gbn0oezE6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7dmFyIHQscixsLG49LTE7aWYoZS5saW5lcy5sZW5ndGg+MSYmXCJmbGV4LXN0YXJ0XCI9PT1lLnN0eWxlLmFsaWduQ29udGVudClmb3IodD0wO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCx0Kz1sLmNyb3NzO2Vsc2UgaWYoZS5saW5lcy5sZW5ndGg+MSYmXCJmbGV4LWVuZFwiPT09ZS5zdHlsZS5hbGlnbkNvbnRlbnQpZm9yKHQ9ZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZTtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsdCs9bC5jcm9zcztlbHNlIGlmKGUubGluZXMubGVuZ3RoPjEmJlwiY2VudGVyXCI9PT1lLnN0eWxlLmFsaWduQ29udGVudClmb3IodD1lLmZsZXhTdHlsZS5jcm9zc1NwYWNlLzI7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LHQrPWwuY3Jvc3M7ZWxzZSBpZihlLmxpbmVzLmxlbmd0aD4xJiZcInNwYWNlLWJldHdlZW5cIj09PWUuc3R5bGUuYWxpZ25Db250ZW50KWZvcihyPWUuZmxleFN0eWxlLmNyb3NzU3BhY2UvKGUubGluZXMubGVuZ3RoLTEpLHQ9MDtsPWUubGluZXNbKytuXTspbC5jcm9zc1N0YXJ0PXQsdCs9bC5jcm9zcytyO2Vsc2UgaWYoZS5saW5lcy5sZW5ndGg+MSYmXCJzcGFjZS1hcm91bmRcIj09PWUuc3R5bGUuYWxpZ25Db250ZW50KWZvcihyPTIqZS5mbGV4U3R5bGUuY3Jvc3NTcGFjZS8oMiplLmxpbmVzLmxlbmd0aCksdD1yLzI7bD1lLmxpbmVzWysrbl07KWwuY3Jvc3NTdGFydD10LHQrPWwuY3Jvc3MrcjtlbHNlIGZvcihyPWUuZmxleFN0eWxlLmNyb3NzU3BhY2UvZS5saW5lcy5sZW5ndGgsdD1lLmZsZXhTdHlsZS5jcm9zc0lubmVyQmVmb3JlO2w9ZS5saW5lc1srK25dOylsLmNyb3NzU3RhcnQ9dCxsLmNyb3NzKz1yLHQrPWwuY3Jvc3N9fSx7fV0sMjpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbihlKXtmb3IodmFyIHQscj0tMTtsaW5lPWUubGluZXNbKytyXTspZm9yKHQ9LTE7Y2hpbGQ9bGluZS5jaGlsZHJlblsrK3RdOyl7dmFyIGw9Y2hpbGQuc3R5bGUuYWxpZ25TZWxmO1wiYXV0b1wiPT09bCYmKGw9ZS5zdHlsZS5hbGlnbkl0ZW1zKSxcImZsZXgtc3RhcnRcIj09PWw/Y2hpbGQuZmxleFN0eWxlLmNyb3NzU3RhcnQ9bGluZS5jcm9zc1N0YXJ0OlwiZmxleC1lbmRcIj09PWw/Y2hpbGQuZmxleFN0eWxlLmNyb3NzU3RhcnQ9bGluZS5jcm9zc1N0YXJ0K2xpbmUuY3Jvc3MtY2hpbGQuZmxleFN0eWxlLmNyb3NzT3V0ZXI6XCJjZW50ZXJcIj09PWw/Y2hpbGQuZmxleFN0eWxlLmNyb3NzU3RhcnQ9bGluZS5jcm9zc1N0YXJ0KyhsaW5lLmNyb3NzLWNoaWxkLmZsZXhTdHlsZS5jcm9zc091dGVyKS8yOihjaGlsZC5mbGV4U3R5bGUuY3Jvc3NTdGFydD1saW5lLmNyb3NzU3RhcnQsY2hpbGQuZmxleFN0eWxlLmNyb3NzT3V0ZXI9bGluZS5jcm9zcyxjaGlsZC5mbGV4U3R5bGUuY3Jvc3M9Y2hpbGQuZmxleFN0eWxlLmNyb3NzT3V0ZXItY2hpbGQuZmxleFN0eWxlLmNyb3NzQmVmb3JlLWNoaWxkLmZsZXhTdHlsZS5jcm9zc0FmdGVyKX19fSx7fV0sMzpbZnVuY3Rpb24oZSx0LHIpe3QuZXhwb3J0cz1mdW5jdGlvbiBsKGUsbCl7dmFyIHQ9XCJyb3dcIj09PWx8fFwicm93LXJldmVyc2VcIj09PWwscj1lLm1haW5BeGlzO2lmKHIpe3ZhciBuPXQmJlwiaW5saW5lXCI9PT1yfHwhdCYmXCJibG9ja1wiPT09cjtufHwoZS5mbGV4U3R5bGU9e21haW46ZS5mbGV4U3R5bGUuY3Jvc3MsY3Jvc3M6ZS5mbGV4U3R5bGUubWFpbixtYWluT2Zmc2V0OmUuZmxleFN0eWxlLmNyb3NzT2Zmc2V0LGNyb3NzT2Zmc2V0OmUuZmxleFN0eWxlLm1haW5PZmZzZXQsbWFpbkJlZm9yZTplLmZsZXhTdHlsZS5jcm9zc0JlZm9yZSxtYWluQWZ0ZXI6ZS5mbGV4U3R5bGUuY3Jvc3NBZnRlcixjcm9zc0JlZm9yZTplLmZsZXhTdHlsZS5tYWluQmVmb3JlLGNyb3NzQWZ0ZXI6ZS5mbGV4U3R5bGUubWFpbkFmdGVyLG1haW5Jbm5lckJlZm9yZTplLmZsZXhTdHlsZS5jcm9zc0lubmVyQmVmb3JlLG1haW5Jbm5lckFmdGVyOmUuZmxleFN0eWxlLmNyb3NzSW5uZXJBZnRlcixjcm9zc0lubmVyQmVmb3JlOmUuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZSxjcm9zc0lubmVyQWZ0ZXI6ZS5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXIsbWFpbkJvcmRlckJlZm9yZTplLmZsZXhTdHlsZS5jcm9zc0JvcmRlckJlZm9yZSxtYWluQm9yZGVyQWZ0ZXI6ZS5mbGV4U3R5bGUuY3Jvc3NCb3JkZXJBZnRlcixjcm9zc0JvcmRlckJlZm9yZTplLmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlLGNyb3NzQm9yZGVyQWZ0ZXI6ZS5mbGV4U3R5bGUubWFpbkJvcmRlckFmdGVyfSl9ZWxzZSB0P2UuZmxleFN0eWxlPXttYWluOmUuc3R5bGUud2lkdGgsY3Jvc3M6ZS5zdHlsZS5oZWlnaHQsbWFpbk9mZnNldDplLnN0eWxlLm9mZnNldFdpZHRoLGNyb3NzT2Zmc2V0OmUuc3R5bGUub2Zmc2V0SGVpZ2h0LG1haW5CZWZvcmU6ZS5zdHlsZS5tYXJnaW5MZWZ0LG1haW5BZnRlcjplLnN0eWxlLm1hcmdpblJpZ2h0LGNyb3NzQmVmb3JlOmUuc3R5bGUubWFyZ2luVG9wLGNyb3NzQWZ0ZXI6ZS5zdHlsZS5tYXJnaW5Cb3R0b20sbWFpbklubmVyQmVmb3JlOmUuc3R5bGUucGFkZGluZ0xlZnQsbWFpbklubmVyQWZ0ZXI6ZS5zdHlsZS5wYWRkaW5nUmlnaHQsY3Jvc3NJbm5lckJlZm9yZTplLnN0eWxlLnBhZGRpbmdUb3AsY3Jvc3NJbm5lckFmdGVyOmUuc3R5bGUucGFkZGluZ0JvdHRvbSxtYWluQm9yZGVyQmVmb3JlOmUuc3R5bGUuYm9yZGVyTGVmdFdpZHRoLG1haW5Cb3JkZXJBZnRlcjplLnN0eWxlLmJvcmRlclJpZ2h0V2lkdGgsY3Jvc3NCb3JkZXJCZWZvcmU6ZS5zdHlsZS5ib3JkZXJUb3BXaWR0aCxjcm9zc0JvcmRlckFmdGVyOmUuc3R5bGUuYm9yZGVyQm90dG9tV2lkdGh9OmUuZmxleFN0eWxlPXttYWluOmUuc3R5bGUuaGVpZ2h0LGNyb3NzOmUuc3R5bGUud2lkdGgsbWFpbk9mZnNldDplLnN0eWxlLm9mZnNldEhlaWdodCxjcm9zc09mZnNldDplLnN0eWxlLm9mZnNldFdpZHRoLG1haW5CZWZvcmU6ZS5zdHlsZS5tYXJnaW5Ub3AsbWFpbkFmdGVyOmUuc3R5bGUubWFyZ2luQm90dG9tLGNyb3NzQmVmb3JlOmUuc3R5bGUubWFyZ2luTGVmdCxjcm9zc0FmdGVyOmUuc3R5bGUubWFyZ2luUmlnaHQsbWFpbklubmVyQmVmb3JlOmUuc3R5bGUucGFkZGluZ1RvcCxtYWluSW5uZXJBZnRlcjplLnN0eWxlLnBhZGRpbmdCb3R0b20sY3Jvc3NJbm5lckJlZm9yZTplLnN0eWxlLnBhZGRpbmdMZWZ0LGNyb3NzSW5uZXJBZnRlcjplLnN0eWxlLnBhZGRpbmdSaWdodCxtYWluQm9yZGVyQmVmb3JlOmUuc3R5bGUuYm9yZGVyVG9wV2lkdGgsbWFpbkJvcmRlckFmdGVyOmUuc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgsY3Jvc3NCb3JkZXJCZWZvcmU6ZS5zdHlsZS5ib3JkZXJMZWZ0V2lkdGgsY3Jvc3NCb3JkZXJBZnRlcjplLnN0eWxlLmJvcmRlclJpZ2h0V2lkdGh9LFwiY29udGVudC1ib3hcIj09PWUuc3R5bGUuYm94U2l6aW5nJiYoXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLm1haW4mJihlLmZsZXhTdHlsZS5tYWluKz1lLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXIrZS5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZStlLmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXIpLFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5jcm9zcyYmKGUuZmxleFN0eWxlLmNyb3NzKz1lLmZsZXhTdHlsZS5jcm9zc0lubmVyQmVmb3JlK2UuZmxleFN0eWxlLmNyb3NzSW5uZXJBZnRlcitlLmZsZXhTdHlsZS5jcm9zc0JvcmRlckJlZm9yZStlLmZsZXhTdHlsZS5jcm9zc0JvcmRlckFmdGVyKSk7ZS5tYWluQXhpcz10P1wiaW5saW5lXCI6XCJibG9ja1wiLGUuY3Jvc3NBeGlzPXQ/XCJibG9ja1wiOlwiaW5saW5lXCIsXCJudW1iZXJcIj09dHlwZW9mIGUuc3R5bGUuZmxleEJhc2lzJiYoZS5mbGV4U3R5bGUubWFpbj1lLnN0eWxlLmZsZXhCYXNpcytlLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUrZS5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXIrZS5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZStlLmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXIpLGUuZmxleFN0eWxlLm1haW5PdXRlcj1lLmZsZXhTdHlsZS5tYWluLGUuZmxleFN0eWxlLmNyb3NzT3V0ZXI9ZS5mbGV4U3R5bGUuY3Jvc3MsXCJhdXRvXCI9PT1lLmZsZXhTdHlsZS5tYWluT3V0ZXImJihlLmZsZXhTdHlsZS5tYWluT3V0ZXI9ZS5mbGV4U3R5bGUubWFpbk9mZnNldCksXCJhdXRvXCI9PT1lLmZsZXhTdHlsZS5jcm9zc091dGVyJiYoZS5mbGV4U3R5bGUuY3Jvc3NPdXRlcj1lLmZsZXhTdHlsZS5jcm9zc09mZnNldCksXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLm1haW5CZWZvcmUmJihlLmZsZXhTdHlsZS5tYWluT3V0ZXIrPWUuZmxleFN0eWxlLm1haW5CZWZvcmUpLFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5tYWluQWZ0ZXImJihlLmZsZXhTdHlsZS5tYWluT3V0ZXIrPWUuZmxleFN0eWxlLm1haW5BZnRlciksXCJudW1iZXJcIj09dHlwZW9mIGUuZmxleFN0eWxlLmNyb3NzQmVmb3JlJiYoZS5mbGV4U3R5bGUuY3Jvc3NPdXRlcis9ZS5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUpLFwibnVtYmVyXCI9PXR5cGVvZiBlLmZsZXhTdHlsZS5jcm9zc0FmdGVyJiYoZS5mbGV4U3R5bGUuY3Jvc3NPdXRlcis9ZS5mbGV4U3R5bGUuY3Jvc3NBZnRlcil9fSx7fV0sNDpbZnVuY3Rpb24oZSx0LHIpe3ZhciBsPWUoXCIuLi9yZWR1Y2VcIik7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2lmKGUubWFpblNwYWNlPjApe3ZhciB0PWwoZS5jaGlsZHJlbixmdW5jdGlvbihlLHQpe3JldHVybiBlK3BhcnNlRmxvYXQodC5zdHlsZS5mbGV4R3Jvdyl9LDApO3Q+MCYmKGUubWFpbj1sKGUuY2hpbGRyZW4sZnVuY3Rpb24ocixsKXtyZXR1cm5cImF1dG9cIj09PWwuZmxleFN0eWxlLm1haW4/bC5mbGV4U3R5bGUubWFpbj1sLmZsZXhTdHlsZS5tYWluT2Zmc2V0K3BhcnNlRmxvYXQobC5zdHlsZS5mbGV4R3JvdykvdCplLm1haW5TcGFjZTpsLmZsZXhTdHlsZS5tYWluKz1wYXJzZUZsb2F0KGwuc3R5bGUuZmxleEdyb3cpL3QqZS5tYWluU3BhY2UsbC5mbGV4U3R5bGUubWFpbk91dGVyPWwuZmxleFN0eWxlLm1haW4rbC5mbGV4U3R5bGUubWFpbkJlZm9yZStsLmZsZXhTdHlsZS5tYWluQWZ0ZXIscitsLmZsZXhTdHlsZS5tYWluT3V0ZXJ9LDApLGUubWFpblNwYWNlPTApfX19LHtcIi4uL3JlZHVjZVwiOjEyfV0sNTpbZnVuY3Rpb24oZSx0LHIpe3ZhciBsPWUoXCIuLi9yZWR1Y2VcIik7dC5leHBvcnRzPWZ1bmN0aW9uKGUpe2lmKGUubWFpblNwYWNlPDApe3ZhciB0PWwoZS5jaGlsZHJlbixmdW5jdGlvbihlLHQpe3JldHVybiBlK3BhcnNlRmxvYXQodC5zdHlsZS5mbGV4U2hyaW5rKX0sMCk7dD4wJiYoZS5tYWluPWwoZS5jaGlsZHJlbixmdW5jdGlvbihyLGwpe3JldHVybiBsLmZsZXhTdHlsZS5tYWluKz1wYXJzZUZsb2F0KGwuc3R5bGUuZmxleFNocmluaykvdCplLm1haW5TcGFjZSxsLmZsZXhTdHlsZS5tYWluT3V0ZXI9bC5mbGV4U3R5bGUubWFpbitsLmZsZXhTdHlsZS5tYWluQmVmb3JlK2wuZmxleFN0eWxlLm1haW5BZnRlcixyK2wuZmxleFN0eWxlLm1haW5PdXRlcn0sMCksZS5tYWluU3BhY2U9MCl9fX0se1wiLi4vcmVkdWNlXCI6MTJ9XSw2OltmdW5jdGlvbihlLHQscil7dmFyIGw9ZShcIi4uL3JlZHVjZVwiKTt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7dmFyIHQ7ZS5saW5lcz1bdD17bWFpbjowLGNyb3NzOjAsY2hpbGRyZW46W119XTtmb3IodmFyIHIsbj0tMTtyPWUuY2hpbGRyZW5bKytuXTspXCJub3dyYXBcIj09PWUuc3R5bGUuZmxleFdyYXB8fDA9PT10LmNoaWxkcmVuLmxlbmd0aHx8XCJhdXRvXCI9PT1lLmZsZXhTdHlsZS5tYWlufHxlLmZsZXhTdHlsZS5tYWluLWUuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZS1lLmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlci1lLmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlLWUuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlcj49dC5tYWluK3IuZmxleFN0eWxlLm1haW5PdXRlcj8odC5tYWluKz1yLmZsZXhTdHlsZS5tYWluT3V0ZXIsdC5jcm9zcz1NYXRoLm1heCh0LmNyb3NzLHIuZmxleFN0eWxlLmNyb3NzT3V0ZXIpKTplLmxpbmVzLnB1c2godD17bWFpbjpyLmZsZXhTdHlsZS5tYWluT3V0ZXIsY3Jvc3M6ci5mbGV4U3R5bGUuY3Jvc3NPdXRlcixjaGlsZHJlbjpbXX0pLHQuY2hpbGRyZW4ucHVzaChyKTtlLmZsZXhTdHlsZS5tYWluTGluZXM9bChlLmxpbmVzLGZ1bmN0aW9uKGUsdCl7cmV0dXJuIE1hdGgubWF4KGUsdC5tYWluKX0sMCksZS5mbGV4U3R5bGUuY3Jvc3NMaW5lcz1sKGUubGluZXMsZnVuY3Rpb24oZSx0KXtyZXR1cm4gZSt0LmNyb3NzfSwwKSxcImF1dG9cIj09PWUuZmxleFN0eWxlLm1haW4mJihlLmZsZXhTdHlsZS5tYWluPU1hdGgubWF4KGUuZmxleFN0eWxlLm1haW5PZmZzZXQsZS5mbGV4U3R5bGUubWFpbkxpbmVzK2UuZmxleFN0eWxlLm1haW5Jbm5lckJlZm9yZStlLmZsZXhTdHlsZS5tYWluSW5uZXJBZnRlcitlLmZsZXhTdHlsZS5tYWluQm9yZGVyQmVmb3JlK2UuZmxleFN0eWxlLm1haW5Cb3JkZXJBZnRlcikpLFwiYXV0b1wiPT09ZS5mbGV4U3R5bGUuY3Jvc3MmJihlLmZsZXhTdHlsZS5jcm9zcz1NYXRoLm1heChlLmZsZXhTdHlsZS5jcm9zc09mZnNldCxlLmZsZXhTdHlsZS5jcm9zc0xpbmVzK2UuZmxleFN0eWxlLmNyb3NzSW5uZXJCZWZvcmUrZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckFmdGVyK2UuZmxleFN0eWxlLmNyb3NzQm9yZGVyQmVmb3JlK2UuZmxleFN0eWxlLmNyb3NzQm9yZGVyQWZ0ZXIpKSxlLmZsZXhTdHlsZS5jcm9zc1NwYWNlPWUuZmxleFN0eWxlLmNyb3NzLWUuZmxleFN0eWxlLmNyb3NzSW5uZXJCZWZvcmUtZS5mbGV4U3R5bGUuY3Jvc3NJbm5lckFmdGVyLWUuZmxleFN0eWxlLmNyb3NzQm9yZGVyQmVmb3JlLWUuZmxleFN0eWxlLmNyb3NzQm9yZGVyQWZ0ZXItZS5mbGV4U3R5bGUuY3Jvc3NMaW5lcyxlLmZsZXhTdHlsZS5tYWluT3V0ZXI9ZS5mbGV4U3R5bGUubWFpbitlLmZsZXhTdHlsZS5tYWluQmVmb3JlK2UuZmxleFN0eWxlLm1haW5BZnRlcixlLmZsZXhTdHlsZS5jcm9zc091dGVyPWUuZmxleFN0eWxlLmNyb3NzK2UuZmxleFN0eWxlLmNyb3NzQmVmb3JlK2UuZmxleFN0eWxlLmNyb3NzQWZ0ZXJ9fSx7XCIuLi9yZWR1Y2VcIjoxMn1dLDc6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKHQpe2Zvcih2YXIgcixsPS0xO3I9dC5jaGlsZHJlblsrK2xdOyllKFwiLi9mbGV4LWRpcmVjdGlvblwiKShyLHQuc3R5bGUuZmxleERpcmVjdGlvbik7ZShcIi4vZmxleC1kaXJlY3Rpb25cIikodCx0LnN0eWxlLmZsZXhEaXJlY3Rpb24pLGUoXCIuL29yZGVyXCIpKHQpLGUoXCIuL2ZsZXhib3gtbGluZXNcIikodCksZShcIi4vYWxpZ24tY29udGVudFwiKSh0KSxsPS0xO2Zvcih2YXIgbjtuPXQubGluZXNbKytsXTspbi5tYWluU3BhY2U9dC5mbGV4U3R5bGUubWFpbi10LmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUtdC5mbGV4U3R5bGUubWFpbklubmVyQWZ0ZXItdC5mbGV4U3R5bGUubWFpbkJvcmRlckJlZm9yZS10LmZsZXhTdHlsZS5tYWluQm9yZGVyQWZ0ZXItbi5tYWluLGUoXCIuL2ZsZXgtZ3Jvd1wiKShuKSxlKFwiLi9mbGV4LXNocmlua1wiKShuKSxlKFwiLi9tYXJnaW4tbWFpblwiKShuKSxlKFwiLi9tYXJnaW4tY3Jvc3NcIikobiksZShcIi4vanVzdGlmeS1jb250ZW50XCIpKG4sdC5zdHlsZS5qdXN0aWZ5Q29udGVudCx0KTtlKFwiLi9hbGlnbi1pdGVtc1wiKSh0KX10LmV4cG9ydHM9bH0se1wiLi9hbGlnbi1jb250ZW50XCI6MSxcIi4vYWxpZ24taXRlbXNcIjoyLFwiLi9mbGV4LWRpcmVjdGlvblwiOjMsXCIuL2ZsZXgtZ3Jvd1wiOjQsXCIuL2ZsZXgtc2hyaW5rXCI6NSxcIi4vZmxleGJveC1saW5lc1wiOjYsXCIuL2p1c3RpZnktY29udGVudFwiOjgsXCIuL21hcmdpbi1jcm9zc1wiOjksXCIuL21hcmdpbi1tYWluXCI6MTAsXCIuL29yZGVyXCI6MTF9XSw4OltmdW5jdGlvbihlLHQscil7dC5leHBvcnRzPWZ1bmN0aW9uKGUsdCxyKXt2YXIgbCxuLG8sZj1yLmZsZXhTdHlsZS5tYWluSW5uZXJCZWZvcmUsaT0tMTtpZihcImZsZXgtZW5kXCI9PT10KWZvcihsPWUubWFpblNwYWNlLGwrPWY7bz1lLmNoaWxkcmVuWysraV07KW8uZmxleFN0eWxlLm1haW5TdGFydD1sLGwrPW8uZmxleFN0eWxlLm1haW5PdXRlcjtlbHNlIGlmKFwiY2VudGVyXCI9PT10KWZvcihsPWUubWFpblNwYWNlLzIsbCs9ZjtvPWUuY2hpbGRyZW5bKytpXTspby5mbGV4U3R5bGUubWFpblN0YXJ0PWwsbCs9by5mbGV4U3R5bGUubWFpbk91dGVyO2Vsc2UgaWYoXCJzcGFjZS1iZXR3ZWVuXCI9PT10KWZvcihuPWUubWFpblNwYWNlLyhlLmNoaWxkcmVuLmxlbmd0aC0xKSxsPTAsbCs9ZjtvPWUuY2hpbGRyZW5bKytpXTspby5mbGV4U3R5bGUubWFpblN0YXJ0PWwsbCs9by5mbGV4U3R5bGUubWFpbk91dGVyK247ZWxzZSBpZihcInNwYWNlLWFyb3VuZFwiPT09dClmb3Iobj0yKmUubWFpblNwYWNlLygyKmUuY2hpbGRyZW4ubGVuZ3RoKSxsPW4vMixsKz1mO289ZS5jaGlsZHJlblsrK2ldOylvLmZsZXhTdHlsZS5tYWluU3RhcnQ9bCxsKz1vLmZsZXhTdHlsZS5tYWluT3V0ZXIrbjtlbHNlIGZvcihsPTAsbCs9ZjtvPWUuY2hpbGRyZW5bKytpXTspby5mbGV4U3R5bGUubWFpblN0YXJ0PWwsbCs9by5mbGV4U3R5bGUubWFpbk91dGVyfX0se31dLDk6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7Zm9yKHZhciB0LHI9LTE7dD1lLmNoaWxkcmVuWysrcl07KXt2YXIgbD0wO1wiYXV0b1wiPT09dC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUmJisrbCxcImF1dG9cIj09PXQuZmxleFN0eWxlLmNyb3NzQWZ0ZXImJisrbDt2YXIgbj1lLmNyb3NzLXQuZmxleFN0eWxlLmNyb3NzT3V0ZXI7XCJhdXRvXCI9PT10LmZsZXhTdHlsZS5jcm9zc0JlZm9yZSYmKHQuZmxleFN0eWxlLmNyb3NzQmVmb3JlPW4vbCksXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5jcm9zc0FmdGVyJiYodC5mbGV4U3R5bGUuY3Jvc3NBZnRlcj1uL2wpLFwiYXV0b1wiPT09dC5mbGV4U3R5bGUuY3Jvc3M/dC5mbGV4U3R5bGUuY3Jvc3NPdXRlcj10LmZsZXhTdHlsZS5jcm9zc09mZnNldCt0LmZsZXhTdHlsZS5jcm9zc0JlZm9yZSt0LmZsZXhTdHlsZS5jcm9zc0FmdGVyOnQuZmxleFN0eWxlLmNyb3NzT3V0ZXI9dC5mbGV4U3R5bGUuY3Jvc3MrdC5mbGV4U3R5bGUuY3Jvc3NCZWZvcmUrdC5mbGV4U3R5bGUuY3Jvc3NBZnRlcn19fSx7fV0sMTA6W2Z1bmN0aW9uKGUsdCxyKXt0LmV4cG9ydHM9ZnVuY3Rpb24oZSl7Zm9yKHZhciB0LHI9MCxsPS0xO3Q9ZS5jaGlsZHJlblsrK2xdOylcImF1dG9cIj09PXQuZmxleFN0eWxlLm1haW5CZWZvcmUmJisrcixcImF1dG9cIj09PXQuZmxleFN0eWxlLm1haW5BZnRlciYmKytyO2lmKHI+MCl7Zm9yKGw9LTE7dD1lLmNoaWxkcmVuWysrbF07KVwiYXV0b1wiPT09dC5mbGV4U3R5bGUubWFpbkJlZm9yZSYmKHQuZmxleFN0eWxlLm1haW5CZWZvcmU9ZS5tYWluU3BhY2UvciksXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5tYWluQWZ0ZXImJih0LmZsZXhTdHlsZS5tYWluQWZ0ZXI9ZS5tYWluU3BhY2UvciksXCJhdXRvXCI9PT10LmZsZXhTdHlsZS5tYWluP3QuZmxleFN0eWxlLm1haW5PdXRlcj10LmZsZXhTdHlsZS5tYWluT2Zmc2V0K3QuZmxleFN0eWxlLm1haW5CZWZvcmUrdC5mbGV4U3R5bGUubWFpbkFmdGVyOnQuZmxleFN0eWxlLm1haW5PdXRlcj10LmZsZXhTdHlsZS5tYWluK3QuZmxleFN0eWxlLm1haW5CZWZvcmUrdC5mbGV4U3R5bGUubWFpbkFmdGVyO2UubWFpblNwYWNlPTB9fX0se31dLDExOltmdW5jdGlvbihlLHQscil7dmFyIGw9L14oY29sdW1ufHJvdyktcmV2ZXJzZSQvO3QuZXhwb3J0cz1mdW5jdGlvbihlKXtlLmNoaWxkcmVuLnNvcnQoZnVuY3Rpb24oZSx0KXtyZXR1cm4gZS5zdHlsZS5vcmRlci10LnN0eWxlLm9yZGVyfHxlLmluZGV4LXQuaW5kZXh9KSxsLnRlc3QoZS5zdHlsZS5mbGV4RGlyZWN0aW9uKSYmZS5jaGlsZHJlbi5yZXZlcnNlKCl9fSx7fV0sMTI6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUsdCxyKXtmb3IodmFyIGw9ZS5sZW5ndGgsbj0tMTsrK248bDspbiBpbiBlJiYocj10KHIsZVtuXSxuKSk7cmV0dXJuIHJ9dC5leHBvcnRzPWx9LHt9XSwxMzpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSl7aShmKGUpKX12YXIgbj1lKFwiLi9yZWFkXCIpLG89ZShcIi4vd3JpdGVcIiksZj1lKFwiLi9yZWFkQWxsXCIpLGk9ZShcIi4vd3JpdGVBbGxcIik7dC5leHBvcnRzPWwsdC5leHBvcnRzLnJlYWQ9bix0LmV4cG9ydHMud3JpdGU9byx0LmV4cG9ydHMucmVhZEFsbD1mLHQuZXhwb3J0cy53cml0ZUFsbD1pfSx7XCIuL3JlYWRcIjoxNSxcIi4vcmVhZEFsbFwiOjE2LFwiLi93cml0ZVwiOjE3LFwiLi93cml0ZUFsbFwiOjE4fV0sMTQ6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUsdCxyKXt2YXIgbD1lW3RdLGY9U3RyaW5nKGwpLm1hdGNoKG8pO2lmKCFmKXt2YXIgYT10Lm1hdGNoKHMpO2lmKGEpe3ZhciBjPWVbXCJib3JkZXJcIithWzFdK1wiU3R5bGVcIl07cmV0dXJuXCJub25lXCI9PT1jPzA6aVtsXXx8MH1yZXR1cm4gbH12YXIgeT1mWzFdLHg9ZlsyXTtyZXR1cm5cInB4XCI9PT14PzEqeTpcImNtXCI9PT14Py4zOTM3KnkqOTY6XCJpblwiPT09eD85Nip5OlwibW1cIj09PXg/LjM5MzcqeSo5Ni8xMDpcInBjXCI9PT14PzEyKnkqOTYvNzI6XCJwdFwiPT09eD85Nip5LzcyOlwicmVtXCI9PT14PzE2Knk6bihsLHIpfWZ1bmN0aW9uIG4oZSx0KXtmLnN0eWxlLmNzc1RleHQ9XCJib3JkZXI6bm9uZSFpbXBvcnRhbnQ7Y2xpcDpyZWN0KDAgMCAwIDApIWltcG9ydGFudDtkaXNwbGF5OmJsb2NrIWltcG9ydGFudDtmb250LXNpemU6MWVtIWltcG9ydGFudDtoZWlnaHQ6MCFpbXBvcnRhbnQ7bWFyZ2luOjAhaW1wb3J0YW50O3BhZGRpbmc6MCFpbXBvcnRhbnQ7cG9zaXRpb246cmVsYXRpdmUhaW1wb3J0YW50O3dpZHRoOlwiK2UrXCIhaW1wb3J0YW50XCIsdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmLHQubmV4dFNpYmxpbmcpO3ZhciByPWYub2Zmc2V0V2lkdGg7cmV0dXJuIHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmKSxyfXQuZXhwb3J0cz1sO3ZhciBvPS9eKFstK10/XFxkKlxcLj9cXGQrKSglfFthLXpdKykkLyxmPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksaT17bWVkaXVtOjQsbm9uZTowLHRoaWNrOjYsdGhpbjoyfSxzPS9eYm9yZGVyKEJvdHRvbXxMZWZ0fFJpZ2h0fFRvcClXaWR0aCQvfSx7fV0sMTU6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUpe3ZhciB0PXthbGlnbkNvbnRlbnQ6XCJzdHJldGNoXCIsYWxpZ25JdGVtczpcInN0cmV0Y2hcIixhbGlnblNlbGY6XCJhdXRvXCIsYm9yZGVyQm90dG9tU3R5bGU6XCJub25lXCIsYm9yZGVyQm90dG9tV2lkdGg6MCxib3JkZXJMZWZ0U3R5bGU6XCJub25lXCIsYm9yZGVyTGVmdFdpZHRoOjAsYm9yZGVyUmlnaHRTdHlsZTpcIm5vbmVcIixib3JkZXJSaWdodFdpZHRoOjAsYm9yZGVyVG9wU3R5bGU6XCJub25lXCIsYm9yZGVyVG9wV2lkdGg6MCxib3hTaXppbmc6XCJjb250ZW50LWJveFwiLGRpc3BsYXk6XCJpbmxpbmVcIixmbGV4QmFzaXM6XCJhdXRvXCIsZmxleERpcmVjdGlvbjpcInJvd1wiLGZsZXhHcm93OjAsZmxleFNocmluazoxLGZsZXhXcmFwOlwibm93cmFwXCIsanVzdGlmeUNvbnRlbnQ6XCJmbGV4LXN0YXJ0XCIsaGVpZ2h0OlwiYXV0b1wiLG1hcmdpblRvcDowLG1hcmdpblJpZ2h0OjAsbWFyZ2luTGVmdDowLG1hcmdpbkJvdHRvbTowLHBhZGRpbmdUb3A6MCxwYWRkaW5nUmlnaHQ6MCxwYWRkaW5nTGVmdDowLHBhZGRpbmdCb3R0b206MCxtYXhIZWlnaHQ6XCJub25lXCIsbWF4V2lkdGg6XCJub25lXCIsbWluSGVpZ2h0OjAsbWluV2lkdGg6MCxvcmRlcjowLHBvc2l0aW9uOlwic3RhdGljXCIsd2lkdGg6XCJhdXRvXCJ9LHI9ZSBpbnN0YW5jZW9mIEVsZW1lbnQ7aWYocil7dmFyIGw9ZS5oYXNBdHRyaWJ1dGUoXCJkYXRhLXN0eWxlXCIpLGk9bD9lLmdldEF0dHJpYnV0ZShcImRhdGEtc3R5bGVcIik6ZS5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiKXx8XCJcIjtsfHxlLnNldEF0dHJpYnV0ZShcImRhdGEtc3R5bGVcIixpKTt2YXIgcz13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSYmZ2V0Q29tcHV0ZWRTdHlsZShlKXx8e307Zih0LHMpO3ZhciBjPWUuY3VycmVudFN0eWxlfHx7fTtuKHQsYyksbyh0LGkpO2Zvcih2YXIgeSBpbiB0KXRbeV09YSh0LHksZSk7dmFyIHg9ZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTt0Lm9mZnNldEhlaWdodD14LmhlaWdodHx8ZS5vZmZzZXRIZWlnaHQsdC5vZmZzZXRXaWR0aD14LndpZHRofHxlLm9mZnNldFdpZHRofXZhciBTPXtlbGVtZW50OmUsc3R5bGU6dH07cmV0dXJuIFN9ZnVuY3Rpb24gbihlLHQpe2Zvcih2YXIgciBpbiBlKXt2YXIgbD1yIGluIHQ7aWYobCllW3JdPXRbcl07ZWxzZXt2YXIgbj1yLnJlcGxhY2UoL1tBLVpdL2csXCItJCZcIikudG9Mb3dlckNhc2UoKSxvPW4gaW4gdDtvJiYoZVtyXT10W25dKX19dmFyIGY9XCItanMtZGlzcGxheVwiaW4gdDtmJiYoZS5kaXNwbGF5PXRbXCItanMtZGlzcGxheVwiXSl9ZnVuY3Rpb24gbyhlLHQpe2Zvcih2YXIgcjtyPWkuZXhlYyh0KTspe3ZhciBsPXJbMV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tW2Etel0vZyxmdW5jdGlvbihlKXtyZXR1cm4gZS5zbGljZSgxKS50b1VwcGVyQ2FzZSgpfSk7ZVtsXT1yWzJdfX1mdW5jdGlvbiBmKGUsdCl7Zm9yKHZhciByIGluIGUpe3ZhciBsPXIgaW4gdDtsJiYhcy50ZXN0KHIpJiYoZVtyXT10W3JdKX19dC5leHBvcnRzPWw7dmFyIGk9LyhbXlxcczo7XSspXFxzKjpcXHMqKFteO10rPylcXHMqKDt8JCkvZyxzPS9eKGFsaWduU2VsZnxoZWlnaHR8d2lkdGgpJC8sYT1lKFwiLi9nZXRDb21wdXRlZExlbmd0aFwiKX0se1wiLi9nZXRDb21wdXRlZExlbmd0aFwiOjE0fV0sMTY6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUpe3ZhciB0PVtdO3JldHVybiBuKGUsdCksdH1mdW5jdGlvbiBuKGUsdCl7Zm9yKHZhciByLGw9byhlKSxpPVtdLHM9LTE7cj1lLmNoaWxkTm9kZXNbKytzXTspe3ZhciBhPTM9PT1yLm5vZGVUeXBlJiYhL15cXHMqJC8udGVzdChyLm5vZGVWYWx1ZSk7aWYobCYmYSl7dmFyIGM9cjtyPWUuaW5zZXJ0QmVmb3JlKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJmbGV4LWl0ZW1cIiksYyksci5hcHBlbmRDaGlsZChjKX12YXIgeT1yIGluc3RhbmNlb2YgRWxlbWVudDtpZih5KXt2YXIgeD1uKHIsdCk7aWYobCl7dmFyIFM9ci5zdHlsZTtTLmRpc3BsYXk9XCJpbmxpbmUtYmxvY2tcIixTLnBvc2l0aW9uPVwiYWJzb2x1dGVcIix4LnN0eWxlPWYocikuc3R5bGUsaS5wdXNoKHgpfX19dmFyIG09e2VsZW1lbnQ6ZSxjaGlsZHJlbjppfTtyZXR1cm4gbCYmKG0uc3R5bGU9ZihlKS5zdHlsZSx0LnB1c2gobSkpLG19ZnVuY3Rpb24gbyhlKXt2YXIgdD1lIGluc3RhbmNlb2YgRWxlbWVudCxyPXQmJmUuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdHlsZVwiKSxsPXQmJmUuY3VycmVudFN0eWxlJiZlLmN1cnJlbnRTdHlsZVtcIi1qcy1kaXNwbGF5XCJdLG49aS50ZXN0KHIpfHxzLnRlc3QobCk7cmV0dXJuIG59dC5leHBvcnRzPWw7dmFyIGY9ZShcIi4uL3JlYWRcIiksaT0vKF58OylcXHMqZGlzcGxheVxccyo6XFxzKihpbmxpbmUtKT9mbGV4XFxzKig7fCQpL2kscz0vXihpbmxpbmUtKT9mbGV4JC9pfSx7XCIuLi9yZWFkXCI6MTV9XSwxNzpbZnVuY3Rpb24oZSx0LHIpe2Z1bmN0aW9uIGwoZSl7byhlKTt2YXIgdD1lLmVsZW1lbnQuc3R5bGUscj1cImlubGluZVwiPT09ZS5tYWluQXhpcz9bXCJtYWluXCIsXCJjcm9zc1wiXTpbXCJjcm9zc1wiLFwibWFpblwiXTt0LmJveFNpemluZz1cImNvbnRlbnQtYm94XCIsdC5kaXNwbGF5PVwiYmxvY2tcIix0LnBvc2l0aW9uPVwicmVsYXRpdmVcIix0LndpZHRoPW4oZS5mbGV4U3R5bGVbclswXV0tZS5mbGV4U3R5bGVbclswXStcIklubmVyQmVmb3JlXCJdLWUuZmxleFN0eWxlW3JbMF0rXCJJbm5lckFmdGVyXCJdLWUuZmxleFN0eWxlW3JbMF0rXCJCb3JkZXJCZWZvcmVcIl0tZS5mbGV4U3R5bGVbclswXStcIkJvcmRlckFmdGVyXCJdKSx0LmhlaWdodD1uKGUuZmxleFN0eWxlW3JbMV1dLWUuZmxleFN0eWxlW3JbMV0rXCJJbm5lckJlZm9yZVwiXS1lLmZsZXhTdHlsZVtyWzFdK1wiSW5uZXJBZnRlclwiXS1lLmZsZXhTdHlsZVtyWzFdK1wiQm9yZGVyQmVmb3JlXCJdLWUuZmxleFN0eWxlW3JbMV0rXCJCb3JkZXJBZnRlclwiXSk7Zm9yKHZhciBsLGY9LTE7bD1lLmNoaWxkcmVuWysrZl07KXt2YXIgaT1sLmVsZW1lbnQuc3R5bGUscz1cImlubGluZVwiPT09bC5tYWluQXhpcz9bXCJtYWluXCIsXCJjcm9zc1wiXTpbXCJjcm9zc1wiLFwibWFpblwiXTtpLmJveFNpemluZz1cImNvbnRlbnQtYm94XCIsaS5kaXNwbGF5PVwiYmxvY2tcIixpLnBvc2l0aW9uPVwiYWJzb2x1dGVcIixcImF1dG9cIiE9PWwuZmxleFN0eWxlW3NbMF1dJiYoaS53aWR0aD1uKGwuZmxleFN0eWxlW3NbMF1dLWwuZmxleFN0eWxlW3NbMF0rXCJJbm5lckJlZm9yZVwiXS1sLmZsZXhTdHlsZVtzWzBdK1wiSW5uZXJBZnRlclwiXS1sLmZsZXhTdHlsZVtzWzBdK1wiQm9yZGVyQmVmb3JlXCJdLWwuZmxleFN0eWxlW3NbMF0rXCJCb3JkZXJBZnRlclwiXSkpLFwiYXV0b1wiIT09bC5mbGV4U3R5bGVbc1sxXV0mJihpLmhlaWdodD1uKGwuZmxleFN0eWxlW3NbMV1dLWwuZmxleFN0eWxlW3NbMV0rXCJJbm5lckJlZm9yZVwiXS1sLmZsZXhTdHlsZVtzWzFdK1wiSW5uZXJBZnRlclwiXS1sLmZsZXhTdHlsZVtzWzFdK1wiQm9yZGVyQmVmb3JlXCJdLWwuZmxleFN0eWxlW3NbMV0rXCJCb3JkZXJBZnRlclwiXSkpLGkudG9wPW4obC5mbGV4U3R5bGVbc1sxXStcIlN0YXJ0XCJdKSxpLmxlZnQ9bihsLmZsZXhTdHlsZVtzWzBdK1wiU3RhcnRcIl0pLGkubWFyZ2luVG9wPW4obC5mbGV4U3R5bGVbc1sxXStcIkJlZm9yZVwiXSksaS5tYXJnaW5SaWdodD1uKGwuZmxleFN0eWxlW3NbMF0rXCJBZnRlclwiXSksaS5tYXJnaW5Cb3R0b209bihsLmZsZXhTdHlsZVtzWzFdK1wiQWZ0ZXJcIl0pLGkubWFyZ2luTGVmdD1uKGwuZmxleFN0eWxlW3NbMF0rXCJCZWZvcmVcIl0pfX1mdW5jdGlvbiBuKGUpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlP2U6TWF0aC5tYXgoZSwwKStcInB4XCJ9dC5leHBvcnRzPWw7dmFyIG89ZShcIi4uL2ZsZXhib3hcIil9LHtcIi4uL2ZsZXhib3hcIjo3fV0sMTg6W2Z1bmN0aW9uKGUsdCxyKXtmdW5jdGlvbiBsKGUpe2Zvcih2YXIgdCxyPS0xO3Q9ZVsrK3JdOyluKHQpfXQuZXhwb3J0cz1sO3ZhciBuPWUoXCIuLi93cml0ZVwiKX0se1wiLi4vd3JpdGVcIjoxN31dfSx7fSxbMTNdKSgxMyl9KTsiLCIvKlxuICogRnV6enlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9teW9yay9mdXp6eVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXR0IFlvcmtcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbnZhciByb290ID0gdGhpcztcblxudmFyIGZ1enp5ID0ge307XG5cbi8vIFVzZSBpbiBub2RlIG9yIGluIGJyb3dzZXJcbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdXp6eTtcbn0gZWxzZSB7XG4gIHJvb3QuZnV6enkgPSBmdXp6eTtcbn1cblxuLy8gUmV0dXJuIGFsbCBlbGVtZW50cyBvZiBgYXJyYXlgIHRoYXQgaGF2ZSBhIGZ1enp5XG4vLyBtYXRjaCBhZ2FpbnN0IGBwYXR0ZXJuYC5cbmZ1enp5LnNpbXBsZUZpbHRlciA9IGZ1bmN0aW9uKHBhdHRlcm4sIGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIGZ1enp5LnRlc3QocGF0dGVybiwgc3RyKTtcbiAgfSk7XG59O1xuXG4vLyBEb2VzIGBwYXR0ZXJuYCBmdXp6eSBtYXRjaCBgc3RyYD9cbmZ1enp5LnRlc3QgPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHIpIHtcbiAgcmV0dXJuIGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0cikgIT09IG51bGw7XG59O1xuXG4vLyBJZiBgcGF0dGVybmAgbWF0Y2hlcyBgc3RyYCwgd3JhcCBlYWNoIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gaW4gYG9wdHMucHJlYCBhbmQgYG9wdHMucG9zdGAuIElmIG5vIG1hdGNoLCByZXR1cm4gbnVsbFxuZnV6enkubWF0Y2ggPSBmdW5jdGlvbihwYXR0ZXJuLCBzdHIsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIHZhciBwYXR0ZXJuSWR4ID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGxlbiA9IHN0ci5sZW5ndGhcbiAgICAsIHRvdGFsU2NvcmUgPSAwXG4gICAgLCBjdXJyU2NvcmUgPSAwXG4gICAgLy8gcHJlZml4XG4gICAgLCBwcmUgPSBvcHRzLnByZSB8fCAnJ1xuICAgIC8vIHN1ZmZpeFxuICAgICwgcG9zdCA9IG9wdHMucG9zdCB8fCAnJ1xuICAgIC8vIFN0cmluZyB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgbWlnaHQgYmUgYSBsb3dlcmNhc2UgdmVyc2lvbiBvZiB0aGVcbiAgICAvLyByYXcgc3RyaW5nXG4gICAgLCBjb21wYXJlU3RyaW5nID0gIG9wdHMuY2FzZVNlbnNpdGl2ZSAmJiBzdHIgfHwgc3RyLnRvTG93ZXJDYXNlKClcbiAgICAsIGNoO1xuXG4gIHBhdHRlcm4gPSBvcHRzLmNhc2VTZW5zaXRpdmUgJiYgcGF0dGVybiB8fCBwYXR0ZXJuLnRvTG93ZXJDYXNlKCk7XG5cbiAgLy8gRm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcsIGVpdGhlciBhZGQgaXQgdG8gdGhlIHJlc3VsdFxuICAvLyBvciB3cmFwIGluIHRlbXBsYXRlIGlmIGl0J3MgdGhlIG5leHQgc3RyaW5nIGluIHRoZSBwYXR0ZXJuXG4gIGZvcih2YXIgaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgIGNoID0gc3RyW2lkeF07XG4gICAgaWYoY29tcGFyZVN0cmluZ1tpZHhdID09PSBwYXR0ZXJuW3BhdHRlcm5JZHhdKSB7XG4gICAgICBjaCA9IHByZSArIGNoICsgcG9zdDtcbiAgICAgIHBhdHRlcm5JZHggKz0gMTtcblxuICAgICAgLy8gY29uc2VjdXRpdmUgY2hhcmFjdGVycyBzaG91bGQgaW5jcmVhc2UgdGhlIHNjb3JlIG1vcmUgdGhhbiBsaW5lYXJseVxuICAgICAgY3VyclNjb3JlICs9IDEgKyBjdXJyU2NvcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJTY29yZSA9IDA7XG4gICAgfVxuICAgIHRvdGFsU2NvcmUgKz0gY3VyclNjb3JlO1xuICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IGNoO1xuICB9XG5cbiAgLy8gcmV0dXJuIHJlbmRlcmVkIHN0cmluZyBpZiB3ZSBoYXZlIGEgbWF0Y2ggZm9yIGV2ZXJ5IGNoYXJcbiAgaWYocGF0dGVybklkeCA9PT0gcGF0dGVybi5sZW5ndGgpIHtcbiAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIGFuIGV4YWN0IG1hdGNoIHdpdGggcGF0dGVybiwgdG90YWxTY29yZSBzaG91bGQgYmUgbWF4ZWRcbiAgICB0b3RhbFNjb3JlID0gKGNvbXBhcmVTdHJpbmcgPT09IHBhdHRlcm4pID8gSW5maW5pdHkgOiB0b3RhbFNjb3JlO1xuICAgIHJldHVybiB7cmVuZGVyZWQ6IHJlc3VsdC5qb2luKCcnKSwgc2NvcmU6IHRvdGFsU2NvcmV9O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vLyBUaGUgbm9ybWFsIGVudHJ5IHBvaW50LiBGaWx0ZXJzIGBhcnJgIGZvciBtYXRjaGVzIGFnYWluc3QgYHBhdHRlcm5gLlxuLy8gSXQgcmV0dXJucyBhbiBhcnJheSB3aXRoIG1hdGNoaW5nIHZhbHVlcyBvZiB0aGUgdHlwZTpcbi8vXG4vLyAgICAgW3tcbi8vICAgICAgICAgc3RyaW5nOiAgICc8Yj5sYWgnIC8vIFRoZSByZW5kZXJlZCBzdHJpbmdcbi8vICAgICAgICwgaW5kZXg6ICAgIDIgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiBgYXJyYFxuLy8gICAgICAgLCBvcmlnaW5hbDogJ2JsYWgnICAgLy8gVGhlIG9yaWdpbmFsIGVsZW1lbnQgaW4gYGFycmBcbi8vICAgICB9XVxuLy9cbi8vIGBvcHRzYCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBiYWcuIERldGFpbHM6XG4vL1xuLy8gICAgb3B0cyA9IHtcbi8vICAgICAgICAvLyBzdHJpbmcgdG8gcHV0IGJlZm9yZSBhIG1hdGNoaW5nIGNoYXJhY3RlclxuLy8gICAgICAgIHByZTogICAgICc8Yj4nXG4vL1xuLy8gICAgICAgIC8vIHN0cmluZyB0byBwdXQgYWZ0ZXIgbWF0Y2hpbmcgY2hhcmFjdGVyXG4vLyAgICAgICwgcG9zdDogICAgJzwvYj4nXG4vL1xuLy8gICAgICAgIC8vIE9wdGlvbmFsIGZ1bmN0aW9uLiBJbnB1dCBpcyBhbiBlbnRyeSBpbiB0aGUgZ2l2ZW4gYXJyYCxcbi8vICAgICAgICAvLyBvdXRwdXQgc2hvdWxkIGJlIHRoZSBzdHJpbmcgdG8gdGVzdCBgcGF0dGVybmAgYWdhaW5zdC5cbi8vICAgICAgICAvLyBJbiB0aGlzIGV4YW1wbGUsIGlmIGBhcnIgPSBbe2NyeWluZzogJ2tvYWxhJ31dYCB3ZSB3b3VsZCByZXR1cm5cbi8vICAgICAgICAvLyAna29hbGEnLlxuLy8gICAgICAsIGV4dHJhY3Q6IGZ1bmN0aW9uKGFyZykgeyByZXR1cm4gYXJnLmNyeWluZzsgfVxuLy8gICAgfVxuZnV6enkuZmlsdGVyID0gZnVuY3Rpb24ocGF0dGVybiwgYXJyLCBvcHRzKSB7XG4gIGlmKCFhcnIgfHwgYXJyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgcmV0dXJuIGFyclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgZWxlbWVudCwgaWR4LCBhcnIpIHtcbiAgICAgIHZhciBzdHIgPSBlbGVtZW50O1xuICAgICAgaWYob3B0cy5leHRyYWN0KSB7XG4gICAgICAgIHN0ciA9IG9wdHMuZXh0cmFjdChlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHZhciByZW5kZXJlZCA9IGZ1enp5Lm1hdGNoKHBhdHRlcm4sIHN0ciwgb3B0cyk7XG4gICAgICBpZihyZW5kZXJlZCAhPSBudWxsKSB7XG4gICAgICAgIHByZXZbcHJldi5sZW5ndGhdID0ge1xuICAgICAgICAgICAgc3RyaW5nOiByZW5kZXJlZC5yZW5kZXJlZFxuICAgICAgICAgICwgc2NvcmU6IHJlbmRlcmVkLnNjb3JlXG4gICAgICAgICAgLCBpbmRleDogaWR4XG4gICAgICAgICAgLCBvcmlnaW5hbDogZWxlbWVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwgW10pXG5cbiAgICAvLyBTb3J0IGJ5IHNjb3JlLiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IHdydCBzdGFibGUvdW5zdGFibGVcbiAgICAvLyBzb3J0aW5nLCBzbyBmb3JjZSBzdGFibGUgYnkgdXNpbmcgdGhlIGluZGV4IGluIHRoZSBjYXNlIG9mIHRpZS5cbiAgICAvLyBTZWUgaHR0cDovL29mYi5uZXQvfnNldGhtbC9pcy1zb3J0LXN0YWJsZS5odG1sXG4gICAgLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgICB2YXIgY29tcGFyZSA9IGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgaWYoY29tcGFyZSkgcmV0dXJuIGNvbXBhcmU7XG4gICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgfSk7XG59O1xuXG5cbn0oKSk7XG5cbiIsIi8qIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlLiBJdCBjb21lcyB3aXRob3V0IGFueSB3YXJyYW50eSwgdG9cbiAgICAgKiB0aGUgZXh0ZW50IHBlcm1pdHRlZCBieSBhcHBsaWNhYmxlIGxhdy4gWW91IGNhbiByZWRpc3RyaWJ1dGUgaXRcbiAgICAgKiBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRG8gV2hhdCBUaGUgRnVjayBZb3UgV2FudFxuICAgICAqIFRvIFB1YmxpYyBMaWNlbnNlLCBWZXJzaW9uIDIsIGFzIHB1Ymxpc2hlZCBieSBTYW0gSG9jZXZhci4gU2VlXG4gICAgICogaHR0cDovL3d3dy53dGZwbC5uZXQvIGZvciBtb3JlIGRldGFpbHMuICovXG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGxlZnRQYWQ7XG5cbnZhciBjYWNoZSA9IFtcbiAgJycsXG4gICcgJyxcbiAgJyAgJyxcbiAgJyAgICcsXG4gICcgICAgJyxcbiAgJyAgICAgJyxcbiAgJyAgICAgICcsXG4gICcgICAgICAgJyxcbiAgJyAgICAgICAgJyxcbiAgJyAgICAgICAgICdcbl07XG5cbmZ1bmN0aW9uIGxlZnRQYWQgKHN0ciwgbGVuLCBjaCkge1xuICAvLyBjb252ZXJ0IGBzdHJgIHRvIGBzdHJpbmdgXG4gIHN0ciA9IHN0ciArICcnO1xuICAvLyBgbGVuYCBpcyB0aGUgYHBhZGAncyBsZW5ndGggbm93XG4gIGxlbiA9IGxlbiAtIHN0ci5sZW5ndGg7XG4gIC8vIGRvZXNuJ3QgbmVlZCB0byBwYWRcbiAgaWYgKGxlbiA8PSAwKSByZXR1cm4gc3RyO1xuICAvLyBgY2hgIGRlZmF1bHRzIHRvIGAnICdgXG4gIGlmICghY2ggJiYgY2ggIT09IDApIGNoID0gJyAnO1xuICAvLyBjb252ZXJ0IGBjaGAgdG8gYHN0cmluZ2BcbiAgY2ggPSBjaCArICcnO1xuICAvLyBjYWNoZSBjb21tb24gdXNlIGNhc2VzXG4gIGlmIChjaCA9PT0gJyAnICYmIGxlbiA8IDEwKSByZXR1cm4gY2FjaGVbbGVuXSArIHN0cjtcbiAgLy8gYHBhZGAgc3RhcnRzIHdpdGggYW4gZW1wdHkgc3RyaW5nXG4gIHZhciBwYWQgPSAnJztcbiAgLy8gbG9vcFxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIGFkZCBgY2hgIHRvIGBwYWRgIGlmIGBsZW5gIGlzIG9kZFxuICAgIGlmIChsZW4gJiAxKSBwYWQgKz0gY2g7XG4gICAgLy8gZGl2aWRlIGBsZW5gIGJ5IDIsIGRpdGNoIHRoZSByZW1haW5kZXJcbiAgICBsZW4gPj49IDE7XG4gICAgLy8gXCJkb3VibGVcIiB0aGUgYGNoYCBzbyB0aGlzIG9wZXJhdGlvbiBjb3VudCBncm93cyBsb2dhcml0aG1pY2FsbHkgb24gYGxlbmBcbiAgICAvLyBlYWNoIHRpbWUgYGNoYCBpcyBcImRvdWJsZWRcIiwgdGhlIGBsZW5gIHdvdWxkIG5lZWQgdG8gYmUgXCJkb3VibGVkXCIgdG9vXG4gICAgLy8gc2ltaWxhciB0byBmaW5kaW5nIGEgdmFsdWUgaW4gYmluYXJ5IHNlYXJjaCB0cmVlLCBoZW5jZSBPKGxvZyhuKSlcbiAgICBpZiAobGVuKSBjaCArPSBjaDtcbiAgICAvLyBgbGVuYCBpcyAwLCBleGl0IHRoZSBsb29wXG4gICAgZWxzZSBicmVhaztcbiAgfVxuICAvLyBwYWQgYHN0cmAhXG4gIHJldHVybiBwYWQgKyBzdHI7XG59XG4iLCJjb25zdCBzaW50ZXJrbGFhcyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ3NpbnRlcmtsYWFzIGVhc3RlciBlZ2cgYWN0aXZhdGVkJylcbiAgY29uc3Qgc2VhcmNoTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKVxuICBjb25zdCBpbnB1dE5vZGUgPSBzZWFyY2hOb2RlLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJylcbiAgY29uc3QgYXV0b2NvbXBsZXRlTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUnKVxuICBsZXQgYXV0b2NvbXBsZXRlID0gZmFsc2VcbiAgY29uc3QgbHlyaWNzID0gW1xuICAgIFtcbiAgICAgIHt3b29yZDogJ0hvb3IgJywgdGltZTogMH0sXG4gICAgICB7d29vcmQ6ICd3aWUgJywgdGltZTogMC4zfSxcbiAgICAgIHt3b29yZDogJ2tsb3B0ICcsIHRpbWU6IDAuNn0sXG4gICAgICB7d29vcmQ6ICdkYWFyICcsIHRpbWU6IDAuOX0sXG4gICAgICB7d29vcmQ6ICdraW5kJywgdGltZTogMS4yfSxcbiAgICAgIHt3b29yZDogJ1xcJ3JlbicsIHRpbWU6IDEuNX1cbiAgICBdLFxuICAgIFtcbiAgICAgIHt3b29yZDogJ0hvb3IgJywgdGltZTogMS44fSxcbiAgICAgIHt3b29yZDogJ3dpZSAnLCB0aW1lOiAyLjF9LFxuICAgICAge3dvb3JkOiAna2xvcHQgJywgdGltZTogMi41fSxcbiAgICAgIHt3b29yZDogJ2RhYXIgJywgdGltZTogMi44fSxcbiAgICAgIHt3b29yZDogJ2tpbmQnLCB0aW1lOiAzLjF9LFxuICAgICAge3dvb3JkOiAnXFwncmVuJywgdGltZTogMy40fVxuICAgIF0sXG4gICAgW1xuICAgICAge3dvb3JkOiAnSG9vciAnLCB0aW1lOiAzLjd9LFxuICAgICAge3dvb3JkOiAnd2llICcsIHRpbWU6IDR9LFxuICAgICAge3dvb3JkOiAndGlrdCAnLCB0aW1lOiA0LjN9LFxuICAgICAge3dvb3JkOiAnZGFhciAnLCB0aW1lOiA0LjZ9LFxuICAgICAge3dvb3JkOiAnemFjaHQnLCB0aW1lOiA0Ljh9LFxuICAgICAge3dvb3JkOiAnamVzICcsIHRpbWU6IDUuM30sXG4gICAgICB7d29vcmQ6ICd0ZWdlbiAnLCB0aW1lOiA1LjV9LFxuICAgICAge3dvb3JkOiAnXFwndCAnLCB0aW1lOiA2LjF9LFxuICAgICAge3dvb3JkOiAncmFhbSAnLCB0aW1lOiA2LjJ9XG4gICAgXVxuICBdXG5cbiAgY29uc3Qgb3JpZ2luYWxWYWx1ZSA9IGlucHV0Tm9kZS52YWx1ZVxuXG4gIGlucHV0Tm9kZS52YWx1ZSA9ICcnXG4gIGlucHV0Tm9kZS5wbGFjZWhvbGRlciA9ICcnXG5cbiAgbHlyaWNzLmZvckVhY2goKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICByb3cuZm9yRWFjaCgod29yZCwgd29yZEluZGV4KSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHdvcmRJbmRleCA9PT0gMCkgaW5wdXROb2RlLnBsYWNlaG9sZGVyID0gJydcbiAgICAgICAgaW5wdXROb2RlLnBsYWNlaG9sZGVyICs9IHdvcmQud29vcmRcbiAgICAgIH0sIHdvcmQudGltZSAqIDEwMDApXG4gICAgICBpZiAobHlyaWNzLmxlbmd0aCA9PT0gcm93SW5kZXggKyAxICYmXG4gICAgICAgICAgbHlyaWNzW3Jvd0luZGV4XS5sZW5ndGggPT09IHdvcmRJbmRleCArIDEpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGlucHV0Tm9kZS52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlucHV0Tm9kZS52YWx1ZSA9IG9yaWdpbmFsVmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5wdXROb2RlLnBsYWNlaG9sZGVyID0gJ1pvZWtlbidcbiAgICAgICAgICBhdXRvY29tcGxldGUgPSB0cnVlXG4gICAgICAgIH0sIHdvcmQudGltZSAqIDEwMDAgKyAxMDAwKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgaW5wdXROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xuICAgIGlmICghYXV0b2NvbXBsZXRlKSByZXR1cm5cblxuICAgIGF1dG9jb21wbGV0ZU5vZGUuaW5uZXJIVE1MID0gJydcblxuICAgIGNvbnN0IGF1dG9jb21wbGV0ZUx5cmljcyA9IFtcbiAgICAgIGAndCBJcyBlZW4gdnJlZW1kJ2xpbmcgemVrZXIsYCxcbiAgICAgIGBkaWUgdmVyZHdhYWx0IGlzIHpla2VyLmAsXG4gICAgICBgJ2sgWmFsIGVlbnMgZXZlbiB2cmFnZW4gbmFhciB6aWpuIG5hYW06YFxuICAgIF1cblxuICAgIGF1dG9jb21wbGV0ZUx5cmljcy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICBjb25zdCByZXN1bHROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgcmVzdWx0Tm9kZS5pbm5lckhUTUwgPSByb3dcbiAgICAgIGF1dG9jb21wbGV0ZU5vZGUuYXBwZW5kQ2hpbGQocmVzdWx0Tm9kZSlcbiAgICB9KVxuICB9KVxuXG4gIGlucHV0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWF1dG9jb21wbGV0ZSkgcmV0dXJuXG4gICAgaWYgKGlucHV0Tm9kZS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAnc2ludCBuaWNvbGFhcycgfHxcbiAgICAgICAgaW5wdXROb2RlLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdzaW50bmljb2xhYXMnIHx8XG4gICAgICAgIGlucHV0Tm9kZS52YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAnc2ludCBuaWtvbGFhcycgfHxcbiAgICAgICAgaW5wdXROb2RlLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdzaW50bmlrb2xhYXMnKSB7XG4gICAgICBpbnB1dE5vZGUudmFsdWUgPSAnJ1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cHM6Ly93d3cueW91dHViZS1ub2Nvb2tpZS5jb20vZW1iZWQvanNPaUtKM2tLWE0/c3RhcnQ9MzAnXG4gICAgfVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgc2ludGVya2xhYXMgfVxuIiwidmFyIGxlZnRQYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpXG52YXIgZ2V0V2VlayA9IHJlcXVpcmUoJy4vZ2V0V2VlaycpXG5cbmZ1bmN0aW9uIGdldFVSTE9mVXNlcnMgKHdlZWtPZmZzZXQsIHR5cGUsIGlkKSB7XG4gIHJldHVybiBgLy8ke3dpbmRvdy5sb2NhdGlvbi5ob3N0fS9tZWV0aW5ncG9pbnRQcm94eS9Sb29zdGVycy1BTCUyRmRvYyUyRmRhZ3Jvb3N0ZXJzJTJGYCArXG4gICAgICBgJHsoZ2V0V2VlaygpICsgd2Vla09mZnNldCl9JTJGJHt0eXBlfSUyRiR7dHlwZX0ke2xlZnRQYWQoaWQsIDUsICcwJyl9Lmh0bWBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRVUkxPZlVzZXJzXG4iLCIvLyBjb3BpZWQgZnJvbSBodHRwOi8vd3d3Lm1lZXRpbmdwb2ludG1jby5ubC9Sb29zdGVycy1BTC9kb2MvZGFncm9vc3RlcnMvdW50aXNzY3JpcHRzLmpzLFxuLy8gd2VyZSB1c2luZyB0aGUgc2FtZSBjb2RlIGFzIHRoZXkgZG8gdG8gYmUgc3VyZSB0aGF0IHdlIGFsd2F5cyBnZXQgdGhlIHNhbWVcbi8vIHdlZWsgbnVtYmVyLlxuZnVuY3Rpb24gZ2V0V2VlayAoKSB7XG4gIC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBkYXRlIG9iamVjdFxuICBjb25zdCB0YXJnZXQgPSBuZXcgRGF0ZSgpXG5cbiAgLy8gSVNPIHdlZWsgZGF0ZSB3ZWVrcyBzdGFydCBvbiBtb25kYXlcbiAgLy8gc28gY29ycmVjdCB0aGUgZGF5IG51bWJlclxuICBjb25zdCBkYXlOciA9ICh0YXJnZXQuZ2V0RGF5KCkgKyA2KSAlIDdcblxuICAvLyBJU08gODYwMSBzdGF0ZXMgdGhhdCB3ZWVrIDEgaXMgdGhlIHdlZWtcbiAgLy8gd2l0aCB0aGUgZmlyc3QgdGh1cnNkYXkgb2YgdGhhdCB5ZWFyLlxuICAvLyBTZXQgdGhlIHRhcmdldCBkYXRlIHRvIHRoZSB0aHVyc2RheSBpbiB0aGUgdGFyZ2V0IHdlZWtcbiAgdGFyZ2V0LnNldERhdGUodGFyZ2V0LmdldERhdGUoKSAtIGRheU5yICsgMylcblxuICAvLyBTdG9yZSB0aGUgbWlsbGlzZWNvbmQgdmFsdWUgb2YgdGhlIHRhcmdldCBkYXRlXG4gIGNvbnN0IGZpcnN0VGh1cnNkYXkgPSB0YXJnZXQudmFsdWVPZigpXG5cbiAgLy8gU2V0IHRoZSB0YXJnZXQgdG8gdGhlIGZpcnN0IHRodXJzZGF5IG9mIHRoZSB5ZWFyXG4gIC8vIEZpcnN0IHNldCB0aGUgdGFyZ2V0IHRvIGphbnVhcnkgZmlyc3RcbiAgdGFyZ2V0LnNldE1vbnRoKDAsIDEpXG4gIC8vIE5vdCBhIHRodXJzZGF5PyBDb3JyZWN0IHRoZSBkYXRlIHRvIHRoZSBuZXh0IHRodXJzZGF5XG4gIGlmICh0YXJnZXQuZ2V0RGF5KCkgIT09IDQpIHtcbiAgICB0YXJnZXQuc2V0TW9udGgoMCwgMSArICgoNCAtIHRhcmdldC5nZXREYXkoKSkgKyA3KSAlIDcpXG4gIH1cblxuICAvLyBUaGUgd2Vla251bWJlciBpcyB0aGUgbnVtYmVyIG9mIHdlZWtzIGJldHdlZW4gdGhlXG4gIC8vIGZpcnN0IHRodXJzZGF5IG9mIHRoZSB5ZWFyIGFuZCB0aGUgdGh1cnNkYXkgaW4gdGhlIHRhcmdldCB3ZWVrXG4gIHJldHVybiAxICsgTWF0aC5jZWlsKChmaXJzdFRodXJzZGF5IC0gdGFyZ2V0KSAvIDYwNDgwMDAwMCkgLy8gNjA0ODAwMDAwID0gNyAqIDI0ICogMzYwMCAqIDEwMDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRXZWVrXG4iLCIvKiBnbG9iYWwgZ2EgRkxBR1MgVVNFUlMgKi9cblxucmVxdWlyZSgnZmxleGliaWxpdHknKVxuXG5jb25zdCBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5Jylcbi8vIGNvbnN0IGdldFVzZXJzID0gcmVxdWlyZSgnLi9nZXRVc2VycycpXG5jb25zdCBnZXRVUkxPZlVzZXIgPSByZXF1aXJlKCcuL2dldFVSTE9mVXNlcicpXG5jb25zdCByZW1vdmVEaWFjcml0aWNzID0gcmVxdWlyZSgnZGlhY3JpdGljcycpLnJlbW92ZVxuY29uc3QgZ2V0V2VlayA9IHJlcXVpcmUoJy4vZ2V0V2VlaycpXG5jb25zdCBlYXN0ZXJFZ2dzID0gcmVxdWlyZSgnLi9lYXN0ZXJFZ2dzJylcblxuY29uc3Qgc2VhcmNoTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZWFyY2gnKVxuY29uc3QgaW5wdXROb2RlID0gc2VhcmNoTm9kZS5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpXG5jb25zdCBhdXRvY29tcGxldGVOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZScpXG5jb25zdCBzY2hlZHVsZUlmcmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzY2hlZHVsZScpXG5jb25zdCBwcmV2QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpWzBdXG5jb25zdCBuZXh0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImJ1dHRvblwiXScpWzFdXG5jb25zdCBjdXJyZW50V2Vla05vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCcpXG5jb25zdCBmYXZOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhdicpXG5cbmlmIChGTEFHUy5pbmRleE9mKCdOT19GRUFUVVJFX0RFVEVDVCcpID09PSAtMSkge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NjaGVkdWxlJykuZ2V0Q2xpZW50UmVjdHMoKVswXS5ib3R0b20gIT09XG4gICAgICBkb2N1bWVudC5ib2R5LmdldENsaWVudFJlY3RzKClbMF0uYm90dG9tKSB7XG4gICAgd2luZG93LmxvY2F0aW9uID0gJ2h0dHA6Ly93d3cubWVldGluZ3BvaW50bWNvLm5sL1Jvb3N0ZXJzLUFML2RvYy8nXG4gIH0gZWxzZSB7XG4gICAgd2luZG93Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24gPSAnaHR0cDovL3d3dy5tZWV0aW5ncG9pbnRtY28ubmwvUm9vc3RlcnMtQUwvZG9jLydcbiAgICB9XG4gIH1cbn0gZWxzZSB7XG4gIGNvbnNvbGUubG9nKCdmZWF0dXJlIGRldGVjdGlvbiBpcyBPRkYnKVxufVxuXG5sZXQgc2VsZWN0ZWRSZXN1bHQgPSAtMVxubGV0IHNlbGVjdGVkVXNlclxubGV0IHJlc3VsdHMgPSBbXVxubGV0IG9mZnNldCA9IDBcblxuZnVuY3Rpb24gZ2V0Q3VycmVudEZhdiAoKSB7XG4gIGlmICghd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmYXYnKSkgcmV0dXJuXG4gIGNvbnN0IGZhdkNvZGUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2ZhdicpLnNwbGl0KCc6JylcbiAgY29uc3QgZmF2ID0gVVNFUlMuZmlsdGVyKHVzZXIgPT4gdXNlci50eXBlID09PSBmYXZDb2RlWzBdICYmIHVzZXIuaW5kZXggPT09IE51bWJlcihmYXZDb2RlWzFdKSlcbiAgcmV0dXJuIGZhdlswXVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VGYXYgKGlzRmF2KSB7XG4gIGlmICghc2VsZWN0ZWRVc2VyKSByZXR1cm5cbiAgaWYgKGlzRmF2KSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmYXYnLCBzZWxlY3RlZFVzZXIudHlwZSArICc6JyArIHNlbGVjdGVkVXNlci5pbmRleClcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2ZhdicpXG4gIH1cbiAgdXBkYXRlRmF2Tm9kZSgpXG59XG5cbmZ1bmN0aW9uIHVzZXJzRXF1YWwgKHVzZXIxLCB1c2VyMikge1xuICBpZiAodXNlcjEgPT0gbnVsbCB8fCB1c2VyMiA9PSBudWxsKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHVzZXIxLnR5cGUgPT09IHVzZXIyLnR5cGUgJiYgdXNlcjEuaW5kZXggPT09IHVzZXIyLmluZGV4XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUZhdk5vZGUgKCkge1xuICBpZiAodXNlcnNFcXVhbChnZXRDdXJyZW50RmF2KCksIHNlbGVjdGVkVXNlcikpIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODM4OydcbiAgfSBlbHNlIHtcbiAgICBmYXZOb2RlLmlubmVySFRNTCA9ICcmI3hFODNBJ1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVdlZWtUZXh0ICgpIHtcbiAgaWYgKG9mZnNldCA9PT0gMCkgY3VycmVudFdlZWtOb2RlLmlubmVySFRNTCA9IGBXZWVrICR7Z2V0V2VlaygpICsgb2Zmc2V0fWBcbiAgZWxzZSBjdXJyZW50V2Vla05vZGUuaW5uZXJIVE1MID0gYDxzdHJvbmc+V2VlayAke2dldFdlZWsoKSArIG9mZnNldH08L3N0cm9uZz5gXG59XG5cbnVwZGF0ZVdlZWtUZXh0KClcblxuc2VhcmNoTm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgaWYgKChyZXN1bHRzLmxlbmd0aCAhPT0gMCkgJiYgKGUua2V5ID09PSAnQXJyb3dEb3duJyB8fCBlLmtleSA9PT0gJ0Fycm93VXAnKSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3RlZCcpKSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0ZWQnKS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpXG5cbiAgICBjb25zdCBjaGFuZ2UgPSBlLmtleSA9PT0gJ0Fycm93RG93bicgPyAxIDogLTFcbiAgICBzZWxlY3RlZFJlc3VsdCArPSBjaGFuZ2VcbiAgICBpZiAoc2VsZWN0ZWRSZXN1bHQgPCAtMSkgc2VsZWN0ZWRSZXN1bHQgPSByZXN1bHRzLmxlbmd0aCAtIDFcbiAgICBlbHNlIGlmIChzZWxlY3RlZFJlc3VsdCA+IHJlc3VsdHMubGVuZ3RoIC0gMSkgc2VsZWN0ZWRSZXN1bHQgPSAtMVxuXG4gICAgaWYgKHNlbGVjdGVkUmVzdWx0ICE9PSAtMSkgYXV0b2NvbXBsZXRlTm9kZS5jaGlsZHJlbltzZWxlY3RlZFJlc3VsdF0uY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKVxuICB9XG59KVxuXG5zZWFyY2hOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgc2VhcmNoTm9kZS5jbGFzc05hbWUgPSAnJ1xuICBhdXRvY29tcGxldGVOb2RlLmlubmVySFRNTCA9ICcnXG4gIGlmIChpbnB1dE5vZGUudmFsdWUudHJpbSgpID09PSAnJykgcmV0dXJuXG5cbiAgc2VsZWN0ZWRSZXN1bHQgPSAtMVxuICByZXN1bHRzID0gZnV6enkuZmlsdGVyKHJlbW92ZURpYWNyaXRpY3MoaW5wdXROb2RlLnZhbHVlKSwgVVNFUlMsIHtcbiAgICBleHRyYWN0OiBmdW5jdGlvbiAoZWwpIHsgcmV0dXJuIHJlbW92ZURpYWNyaXRpY3MoZWwudmFsdWUpIH1cbiAgfSkuc2xpY2UoMCwgNylcblxuICByZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIGNvbnN0IHJlc3VsdE5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gICAgcmVzdWx0Tm9kZS5pbm5lckhUTUwgPSBgJHtyZXN1bHQub3JpZ2luYWwudmFsdWV9YFxuICAgIGF1dG9jb21wbGV0ZU5vZGUuYXBwZW5kQ2hpbGQocmVzdWx0Tm9kZSlcbiAgfSlcbn0pXG5cbnNlYXJjaE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0Jywgc3VibWl0Rm9ybSlcblxuZnVuY3Rpb24gc3VibWl0Rm9ybSAoZSkge1xuICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXG4gIGlmIChyZXN1bHRzLmxlbmd0aCAhPT0gMCkge1xuICAgIGNvbnN0IGluZGV4SW5SZXN1bHQgPSBzZWxlY3RlZFJlc3VsdCA9PT0gLTEgPyAwIDogc2VsZWN0ZWRSZXN1bHRcbiAgICBzZWxlY3RlZFVzZXIgPSBVU0VSU1tyZXN1bHRzW2luZGV4SW5SZXN1bHRdLmluZGV4XVxuICB9XG4gIGlmIChzZWxlY3RlZFVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cbiAgdXBkYXRlRmF2Tm9kZSgpXG5cbiAgaW5wdXROb2RlLnZhbHVlID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG4gIGF1dG9jb21wbGV0ZU5vZGUuaW5uZXJIVE1MID0gJydcblxuICBpbnB1dE5vZGUuYmx1cigpXG5cbiAgc2NoZWR1bGVJZnJhbWUuc3JjID0gZ2V0VVJMT2ZVc2VyKG9mZnNldCwgc2VsZWN0ZWRVc2VyLnR5cGUsIHNlbGVjdGVkVXNlci5pbmRleCArIDEpXG5cbiAgbGV0IGV2ZW50QWN0aW9uXG4gIHN3aXRjaCAoc2VsZWN0ZWRVc2VyLnR5cGUpIHtcbiAgICBjYXNlICdjJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ0NsYXNzJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICd0JzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1RlYWNoZXInXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3InOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnUm9vbSdcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncyc6XG4gICAgICBldmVudEFjdGlvbiA9ICdTdHVkZW50J1xuICAgICAgYnJlYWtcbiAgfVxuICBjb25zdCBldmVudExhYmVsID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG5cbiAgZ2EoZnVuY3Rpb24gKCkge1xuICAgIGdhKCdzZW5kJywgeyBoaXRUeXBlOiAnZXZlbnQnLCBldmVudENhdGVnb3J5OiAnc2VhcmNoJywgZXZlbnRBY3Rpb24sIGV2ZW50TGFiZWwgfSlcbiAgfSlcbn1cblxuYXV0b2NvbXBsZXRlTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gIGlmIChhdXRvY29tcGxldGVOb2RlLmNvbnRhaW5zKGUudGFyZ2V0KSkge1xuICAgIHNlbGVjdGVkUmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChlLnRhcmdldC5wYXJlbnRFbGVtZW50LmNoaWxkTm9kZXMsIGUudGFyZ2V0KVxuICAgIHN1Ym1pdEZvcm0oKVxuICB9XG59KVxuXG5wcmV2QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBvZmZzZXQtLVxuICB1cGRhdGVXZWVrVGV4dCgpXG4gIHN1Ym1pdEZvcm0oKVxufSlcblxubmV4dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgb2Zmc2V0KytcbiAgdXBkYXRlV2Vla1RleHQoKVxuICBzdWJtaXRGb3JtKClcbn0pXG5cbmlucHV0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgaW5wdXROb2RlLnNlbGVjdCgpXG59KVxuXG5pbnB1dE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgaXNTYWZhcmkgPSAvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gIGlmICghaXNTYWZhcmkpIHtcbiAgICBpbnB1dE5vZGUuc2VsZWN0aW9uU3RhcnQgPSBpbnB1dE5vZGUuc2VsZWN0aW9uRW5kID0gLTFcbiAgfVxufSlcblxuc2VhcmNoTm9kZS5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgZnVuY3Rpb24gKGUpIHtcbiAgYXV0b2NvbXBsZXRlTm9kZS5pbm5lckhUTUwgPSAnJ1xufSlcblxuZmF2Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgaWYgKHVzZXJzRXF1YWwoZ2V0Q3VycmVudEZhdigpLCBzZWxlY3RlZFVzZXIpKSB7XG4gICAgY2hhbmdlRmF2KGZhbHNlKVxuICB9IGVsc2Uge1xuICAgIGNoYW5nZUZhdih0cnVlKVxuICB9XG59KVxuXG5jb25zdCBjdXJyZW50RmF2ID0gZ2V0Q3VycmVudEZhdigpXG5cbmlmIChjdXJyZW50RmF2KSB7XG4gIHNlbGVjdGVkVXNlciA9IGN1cnJlbnRGYXZcbiAgaW5wdXROb2RlLnZhbHVlID0gc2VsZWN0ZWRVc2VyLnZhbHVlXG4gIHNjaGVkdWxlSWZyYW1lLnNyYyA9IGdldFVSTE9mVXNlcihvZmZzZXQsIHNlbGVjdGVkVXNlci50eXBlLCBzZWxlY3RlZFVzZXIuaW5kZXggKyAxKVxuICB1cGRhdGVGYXZOb2RlKClcblxuICBsZXQgZXZlbnRBY3Rpb25cbiAgc3dpdGNoIChzZWxlY3RlZFVzZXIudHlwZSkge1xuICAgIGNhc2UgJ2MnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnQ2xhc3MnXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3QnOlxuICAgICAgZXZlbnRBY3Rpb24gPSAnVGVhY2hlcidcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncic6XG4gICAgICBldmVudEFjdGlvbiA9ICdSb29tJ1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdzJzpcbiAgICAgIGV2ZW50QWN0aW9uID0gJ1N0dWRlbnQnXG4gICAgICBicmVha1xuICB9XG4gIGNvbnN0IGV2ZW50TGFiZWwgPSBzZWxlY3RlZFVzZXIudmFsdWVcblxuICBnYShmdW5jdGlvbiAoKSB7XG4gICAgZ2EoJ3NlbmQnLCB7IGhpdFR5cGU6ICdldmVudCcsIGV2ZW50Q2F0ZWdvcnk6ICdzZWFyY2ggZmF2JywgZXZlbnRBY3Rpb24sIGV2ZW50TGFiZWwgfSlcbiAgfSlcbn0gZWxzZSBpZiAoaW5wdXROb2RlLnZhbHVlID09PSAnJykge1xuICBzZWFyY2hOb2RlLmNsYXNzTmFtZSA9ICduby1pbnB1dCdcbiAgaW5wdXROb2RlLmZvY3VzKClcbn1cblxuZG9jdW1lbnQuYm9keS5zdHlsZS5vcGFjaXR5ID0gJzEnXG5cbndpbmRvdy5lYXN0ZXJFZ2dzID0gZWFzdGVyRWdnc1xuIl19
