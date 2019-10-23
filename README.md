

# UCDB, a UniCodeDataBase


<!--
## Loading the Configuration

Standard locations for discovering UCDB configuration settings are, in this order:

* A JSON object (a.k.a. dictionary, map) store in the parent app's `package.json`.

## Determining Standard Paths

When the UCDB configuration is loaded implicitly, the following standard paths need be determined:

* **User Home Directory**: is determined using NodeJS's `os.homedir()`;
* **Parent App Directory**: this is the home directory of the software / package that has UCDB as direct or
  indirect dependency. This is defined to be the one found by
  [`app-root-path`](https://github.com/inxilpro/node-app-root-path), q.v.; most of the time,

 -->



# UCDB-Dev


<!--
## Loading the Configuration

Standard locations for discovering UCDB configuration settings are, in this order:

* A JSON object (a.k.a. dictionary, map) store in the parent app's `package.json`.

## Determining Standard Paths

When the UCDB configuration is loaded implicitly, the following standard paths need be determined:

* **User Home Directory**: is determined using NodeJS's `os.homedir()`;
* **Parent App Directory**: this is the home directory of the software / package that has UCDB as direct or
  indirect dependency. This is defined to be the one found by
  [`app-root-path`](https://github.com/inxilpro/node-app-root-path), q.v.; most of the time,

 -->

# Use Cases

## Font Identification Per Style and Codepoint

## Font Generation

UCDB can store glyph outlines for multiple fonts per codepoint.

In the future distinction between styles will be added so it will be possible to query
for the preferred font to typeset, say, character U+570b 國 in bold, serif or
sans-serif style.

outlines are stored as SVG pathdata literals (i.e. the value of the `d` attribute in `<path d='...'/>` SVG
elements)

Fonts (in TTF, OTF formats) may be generated with SvgTtf from the accumulated data such that they cover
either:

(a) codepoint intervals of 32K (32768) positions (such that each Unicode plane of 64K positions is covered
	by two fonts, one for the codepoint interval `0x__000..0x__7ff` and one for the interval `0x__800..0xfff`).
	These are dubbed Half Plane Fonts (HPFs).

(b) Unicode blocks as specified and/or arbitrary codepoint collections.

Choice (b) is left for the future, **for the moment we only support monospaced HPFs** to accommodate for the
most important use case, namely providing fonts for CJK ideographs.

## Outlines

<!--
    aggregate
    onefont
    stylefont
    unifont
    combifonts
    fusion
    fusefont
 -->

`outlines_of_sourcefonts`
`outlines_of_combifonts`






