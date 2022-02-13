class Table {
    MinX = 0;
    MinXModifiable = true;
    MaxX = 0;
    MaxXModifiable = true;
    MinY = 0;
    MinYModifiable = true;
    MaxY = 0;
    MaxYModifiable = true;
    XResolution = 8;
    XResolutionModifiable = true;
    YResolution = 8;
    YResolutionModifiable = true;
    OnChange = [];
    Value = [0];
    XLabel = ``;
    YLabel = ``;
    ZLabel = ``;
    Hidden = false;
    
    constructor(GUID, copyObject){
        this.GUID = GUID;
        if(copyObject)
            Object.assign(this, copyObject);
        var onChange = this.OnChange;
        this.OnChange = [];
        this.SetXResolution(this.XResolution);
        this.SetYResolution(this.YResolution);
        this.OnChange = onChange;
        if(!Array.isArray(this.OnChange))
            this.OnChange = [ this.OnChange ];
    }

    SetXResolution(xRes){
        this.MaxX = parseFloat((this.MaxX - this.MinX) * (xRes-1) / (this.XResolution-1) + this.MinX);
        var newValue = new Array(Math.max(1, xRes) * Math.max(1, this.YResolution));
        for(var x=0; x<xRes; x++){
            for(var y=0; y<this.YResolution; y++){
                var oldValuesIndex = x + this.XResolution * y;
                var newValuesIndex = x + xRes * y;
                if(x >= this.XResolution){
                    var newValuesIndexMinus1 = (x-1) + xRes * y;
                    var newValuesIndexMinus2 = (x-2) + xRes * y;
                    if(x>1){
                        newValue[newValuesIndex] = newValue[newValuesIndexMinus1] + (newValue[newValuesIndexMinus1] - newValue[newValuesIndexMinus2]);
                    }
                } else {
                    newValue[newValuesIndex] = this.Value[oldValuesIndex];
                }
            }
        }
        this.XResolution = xRes;
        this.Value = newValue;
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    SetYResolution(yRes){
        this.MaxY = parseFloat((this.MaxY - this.MinY) * (yRes-1) / (this.YResolution-1) + this.MinY);
        var newValue = new Array(Math.max(1, this.XResolution) * Math.max(1, yRes));
        for(var x=0; x<this.XResolution; x++){
            for(var y=0; y<yRes; y++){
                var valuesIndex = x + this.XResolution * y;
                if(y >= this.YResolution){
                    var valuesIndexMinus1 = x + this.XResolution * (y-1);
                    var valuesIndexMinus2 = x + this.XResolution * (y-2);
                    if(y>1){
                        newValue[valuesIndex] = newValue[valuesIndexMinus1] + (newValue[valuesIndexMinus1] - newValue[valuesIndexMinus2]);
                    }
                } else {
                    newValue[valuesIndex] = this.Value[valuesIndex];
                }
            }
        }
        this.YResolution = yRes;
        this.Value = newValue;
        this.OnChange.forEach(function(OnChange) { OnChange(); });
    }

    Detach() {
        $(document).off(`change.${this.GUID}`);
        $(document).off(`click.${this.GUID}`);
        $(document).off(`mousedown.${this.GUID}`);
        $(document).off(`mouseup.${this.GUID}`);
        $(document).off(`mousemove.${this.GUID}`);
        $(document).off(`copy.${this.GUID}`);
        $(document).off(`paste.${this.GUID}`);
        $(document).off(`contextmenu.${this.GUID}`);
        $(document).off(`touchstart.${this.GUID}`);
        $(document).off(`touchend.${this.GUID}`);
        $(document).off(`touchmove.${this.GUID}`);
    }

    Attach() {
        this.Detach();
        var thisClass = this;

        $(document).on(`click.${this.GUID}`, `#${this.GUID}-equal`, function(){
            var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
            if(isNaN(value))
                return;
            $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
                const id = $(cell).attr(`id`);
                const cellx = parseInt($(cell).data(`x`));
                const celly = parseInt($(cell).data(`y`));
                index = cellx + celly * thisClass.XResolution;
                thisClass.Value[index] = value;
                $(cell).replaceWith(Table.FormatCellForDisplay(id, cellx, celly, thisClass.Value[index]));
            });
            thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
        });
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-add`, function(){
            var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
            if(isNaN(value))
                return;
            $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
                const id = $(cell).attr(`id`);
                const cellx = parseInt($(cell).data(`x`));
                const celly = parseInt($(cell).data(`y`));
                index = cellx + celly * thisClass.XResolution;
                thisClass.Value[index] += value;
                $(cell).replaceWith(Table.FormatCellForDisplay(id, cellx, celly, thisClass.Value[index]));
            });
            thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
        });
        $(document).on(`click.${this.GUID}`, `#${this.GUID}-multiply`, function(){
            var value = parseFloat($(`#${thisClass.GUID}-modifyvalue`).val());
            if(isNaN(value))
                return;
            $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
                const id = $(cell).attr(`id`);
                const cellx = parseInt($(cell).data(`x`));
                const celly = parseInt($(cell).data(`y`));
                index = cellx + celly * thisClass.XResolution;
                thisClass.Value[index] *= value;
                $(cell).replaceWith(Table.FormatCellForDisplay(id, cellx, celly, thisClass.Value[index]));
            });
            thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
        });

        $(document).on(`change.${this.GUID}`, `#${this.GUID}-table`, function(e){
            var x = parseInt($(e.target).data(`x`));
            var y = parseInt($(e.target).data(`y`));
            var value = parseFloat($(e.target).val());
            
            if(x === -1) {
                if(y === 0){
                    //TODO interpolate
                    thisClass.MinY = value;
                } else if (y === thisClass.YResolution - 1){
                    //TODO interpolate
                    thisClass.MaxY = value;
                }
                for(var i = 1; i < thisClass.YResolution - 1; i++) {
                    $(`#${thisClass.GUID}-table .number[data-x='-1'][data-y='${i}']`).html(FormatNumberForDisplay((thisClass.MaxY - thisClass.MinY) * i / (thisClass.YResolution-1) + thisClass.MinY));
                }
            } else if(y === -1) {
                if(x === 0){
                    //TODO interpolate
                    thisClass.MinX = value;
                } else if (x === thisClass.XResolution - 1){
                    //TODO interpolate
                    thisClass.MaxX = value;
                }
                for(var i = 1; i < thisClass.XResolution - 1; i++) {
                    $(`#${thisClass.GUID}-table .number[data-x='${i}'][data-y='-1']`).html(FormatNumberForDisplay((thisClass.MaxX - thisClass.MinX) * i / (thisClass.XResolution-1) + thisClass.MinX));
                }
            } else {
                $.each($(`#${thisClass.GUID}-table .number.selected`), function(index, cell) {
                    const cellx = parseInt($(cell).data(`x`));
                    const celly = parseInt($(cell).data(`y`));
                    index = cellx + celly * thisClass.XResolution;
                    thisClass.Value[index] = value;
                    if(cellx !== x || celly !== y)
                        $(cell).html(thisClass.Value[index]);
                });
            }
            thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
        });

        var selecting = false;
        var dragX = false;
        var dragY = false;
        var pointX;
        var pointY;

        $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .rowcol_expand`, function(e){
            dragY = true;
            dragX = true;
            $(`#overlay`).addClass(`rowcol_expand`);
            $(`#overlay`).show();
        });

        $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .col_expand`, function(e){
            dragX = true;
            $(`#overlay`).addClass(`col_expand`);
            $(`#overlay`).show();
        });

        $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table .row_expand`, function(e){
            dragY = true;
            $(`#overlay`).addClass(`row_expand`);
            $(`#overlay`).show();
        });

        function down() {
            $(this).focus();
            var previousOrigSelect = $(`#${thisClass.GUID}-table .origselect`);
            $(`#${thisClass.GUID}-table .number`).removeClass(`selected`);
            $(`#${thisClass.GUID}-table .number`).removeClass(`origselect`);
            previousOrigSelect.replaceWith(Table.FormatCellForDisplay(previousOrigSelect.attr(`id`)));

            if($(this).data(`x`) === undefined || parseInt($(this).data(`x`)) < 0 || $(this).data(`y`) === undefined || parseInt($(this).data(`y`)) < 0)
                return;

            pointX =  $(this).offset().left - $(this).closest(`table`).offset().left;
            pointY =  $(this).offset().top - $(this).closest(`table`).offset().top;

            $(this).addClass(`selected`);
            $(this).addClass(`origselect`);
            selecting = true;
        }

        function up() {
            if(selecting) {
                $(`#${thisClass.GUID}-table .origselect`).replaceWith(Table.FormatCellForDisplay($(`#${thisClass.GUID}-table .origselect`).attr(`id`)));
                $(`#${thisClass.GUID}-table .origselect`).select();
            }
            selecting = false;
            dragX = false;
            dragY = false;
            $(`#overlay`).removeClass(`col_expand`);
            $(`#overlay`).removeClass(`row_expand`);
            $(`#overlay`).removeClass(`rowcol_expand`);
            $(`#overlay`).hide();
        }

        var selectOnMove = false;
        function move(pageX, pageY) {
            var tableElement = $(`#${thisClass.GUID}-table`);
            if(dragX) {
                var cellElement = $(`#${thisClass.GUID}-${thisClass.XResolution - 1}-axis`);
                var relX = pageX - tableElement.offset().left;
                var elX = cellElement.offset().left - tableElement.offset().left;
                var comp = relX - elX;
                if(comp > (cellElement.width() * 3/2)){
                    thisClass.SetXResolution(thisClass.XResolution + 1);
                    thisClass.UpdateTable();
                }
                if(comp < 0 && thisClass.XResolution > 2){
                    thisClass.SetXResolution(thisClass.XResolution - 1);
                    thisClass.UpdateTable();
                }
            }
            if(dragY) {
                var cellElement = $(`#${thisClass.GUID}-axis-${thisClass.YResolution - 1}`);
                var relY = pageY - tableElement.offset().top;
                var elY = cellElement.offset().top - tableElement.offset().top;
                var comp = relY - elY;
                if(comp > (cellElement.height() * 3/2)){
                    thisClass.SetYResolution(thisClass.YResolution + 1);
                    thisClass.UpdateTable();
                }
                if(comp < 0 && thisClass.YResolution > 2){
                    thisClass.SetYResolution(thisClass.YResolution - 1);
                    thisClass.UpdateTable();
                }
            }
            if(selecting || selectOnMove){
                $.each($(`#${thisClass.GUID}-table .number`), function(index, cell) {
                    var cellElement = $(cell);
                    if(cellElement.data(`x`) === undefined || parseInt(cellElement.data(`x`)) < 0 || cellElement.data(`y`) === undefined || parseInt(cellElement.data(`y`)) < 0)
                        return;
        
                    var relX = pageX - tableElement.offset().left;
                    var elX = cellElement.offset().left - tableElement.offset().left;
                    var relY = pageY - tableElement.offset().top;
                    var elY = cellElement.offset().top - tableElement.offset().top;
                    if(((elX <= relX && elX >= pointX) || (elX >= (relX - cellElement.width()) && elX <= pointX) || (pointX == cellElement.offset().left - tableElement.offset().left)) &&
                        ((elY <= relY && elY >= pointY) || (elY >= (relY - cellElement.height()) && elY <= pointY) || (pointY == cellElement.offset().top - tableElement.offset().top))) {
                        if(selecting)
                            cellElement.addClass(`selected`);
                        else if (selectOnMove && !cellElement.hasClass(`origselect`)) {
                            selectOnMove = false;
                            selecting = true;
                        }
                    } else if(selecting) {
                        cellElement.removeClass(`selected`);
                    }
                });
            }
        }

        $(document).on(`contextmenu.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
            down.call(this);
            e.preventDefault();
        });
        $(document).on(`mousedown.${this.GUID}`, `#${this.GUID}-table div.number`, function(e){
            if(e.which === 3) {
                down.call(this);
                $(`#${$(this).attr(`id`)}`).select();
                up.call(this);
                e.preventDefault();
            } else if(e.which == 1) {
                down.call(this);
            }
        });
        
        $(document).on(`touchend.${this.GUID}`, function(e){
            up.call(this);
        });
        $(document).on(`mouseup.${this.GUID}`, function(e){
            up.call(this);
        });
        
        $(document).on(`touchmove.${this.GUID}`, function(e){
            var touch = e.touches[e.touches.length - 1];
            move(touch.pageX, touch.pageY);
        });
        $(document).on(`mousemove.${this.GUID}`, function(e){
            move(e.pageX, e.pageY);
        });

        function getCopyData() {
            var copyData = ``;

            for(var y = 0; y < thisClass.YResolution; y++){
                var rowSelected = false
                    for(var x = 0; x < thisClass.XResolution; x++){
                    if($(`#${thisClass.GUID}-table .number[data-x='${x}'][data-y='${y}']`).hasClass(`selected`)){
                        if(rowSelected){
                            copyData += `\t`;
                        }
                        copyData += thisClass.Value[x + y * thisClass.XResolution];
                        rowSelected = true;
                    }
                }
                if(rowSelected){
                    copyData += `\n`;
                }
            }

            if(copyData.length > 0){
                copyData = copyData.substring(0, copyData.length -1);//remove last new line
            }

            return copyData;
        }

        function pasteData(x,y,data,special) {
            $.each(data.split(`\n`), function(yIndex, val) {
                var yPos = y + yIndex;
                if(yPos > thisClass.YResolution - 1)
                    return;
                $.each(val.split(`\t`), function(xIndex, val) {
                    var xPos = x + xIndex;
                    if(xPos > thisClass.XResolution - 1)
                        return;

                    var v = parseFloat(val);

                    switch(special)
                    {
                        case `add`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] += v;
                            break;
                        case `subtract`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] -= v;
                            break;
                        case `multiply`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= v;
                            break;
                        case `multiply%`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= 1 + (v/100);
                            break;
                        case `multiply%/2`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] *= 1 + (v/200);
                            break;
                        case `average`:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] += v;
                            thisClass.Value[xPos + yPos * thisClass.XResolution] /= 2;
                            break;
                        default:
                            thisClass.Value[xPos + yPos * thisClass.XResolution] = v;
                            break;
                    }
                    var cell = $(`#${thisClass.GUID}-table .number[data-x='${xPos}'][data-y='${yPos}']`);
                    cell.addClass(`selected`);
                    const id = cell.attr(`id`);
                    cell.replaceWith(Table.FormatCellForDisplay(id, xPos, yPos, thisClass.Value[xPos + yPos * thisClass.XResolution]));
                    $(`#${id}`).select();
                });
            });
            thisClass.OnChange.forEach(function(OnChange) { OnChange(); });
        }

        $(document).on(`copy.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
            if($(this).data(`x`) === undefined || parseInt($(this).data(`x`)) < 0 || $(this).data(`y`) === undefined || parseInt($(this).data(`y`)) < 0)
                return;

            selecting = false;
            e.originalEvent.clipboardData.setData(`text/plain`, getCopyData());
            e.preventDefault();
        });

        $(document).on(`paste.${this.GUID}`, `#${this.GUID}-table .number`, function(e){
            if($(this).data(`x`) === undefined || parseInt($(this).data(`x`)) < 0 || $(this).data(`y`) === undefined || parseInt($(this).data(`y`)) < 0)
                return;
            var val = e.originalEvent.clipboardData.getData(`text/plain`);

            var selectedCell = $(`#${thisClass.GUID}-table .number.origselect`)
            var x = selectedCell.data(`x`);
            var y = selectedCell.data(`y`);
            if(x < 0 || y < 0)
                return;

            pasteData(x,y,val,pastetype);

            selecting = false;
            e.preventDefault();
        });
    }

    GetHtml() {
        return `<div id="${this.GUID}"${this.Hidden? ` style="display: none;"` : ``} class="configtable"> 
    <div style="display:block;">${GetPasteOptions()}<div style="display:inline-block; position: relative;"><div style="width: 100; position: absolute; top: -10; left: 32px;z-index:1">Modify</div><div class="container">
    <div id="${this.GUID}-equal" class="modify-button"><h3>&nbsp;=&nbsp;</h3></div>
    <div id="${this.GUID}-add" class="modify-button"><h3>&nbsp;+&nbsp;</h3></div>
    <div id="${this.GUID}-multiply" class="modify-button"><h3>&nbsp;x&nbsp;</h3></div>
    <input id="${this.GUID}-modifyvalue" class="modify-button" type="number"></input>
    </div></div></div>` + this.GetTable() + 
`</div>`;
    }
    
    Hide() {
        this.Hidden = true;
        $(`#${this.GUID}`).hide();
    }

    Show() {
        this.Hidden = false;
        $(`#${this.GUID}`).show();
    }

    UpdateTable() {
        $(`#${this.GUID}-table`).replaceWith(this.GetTable());
    }

    GetTable() {
        var row = ``;
        var table = `<table id="${this.GUID}-table">`;

        var xstart = -1;
        var ystart = -1;
        if(this.YResolution > 1 && this.XResolution > 1) {
            xstart = -2;
            ystart = -2;
        }

        var xLabel = $(`#${this.GUID}-xlabel`).html();
        if(xLabel === undefined || xLabel === ``)
            xLabel = this.XLabel;
        var yLabel = $(`#${this.GUID}-ylabel`).html();
        if(yLabel === undefined || yLabel === ``)
            yLabel = this.YLabel;
        var zLabel = $(`#${this.GUID}-zlabel`).html();
        if(zLabel === undefined || zLabel === ``)
            zLabel = this.ZLabel;

        for(var y = ystart; y < this.YResolution + 1; y++) {
            var row = `<tr>`;
            for(var x = xstart; x < this.XResolution + 1; x++) {
                if(y === -2){
                    if(x == -2) {
                        // X-X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += `<td></td><td></td><td></td>`;
                    } else if(x === 0){
                        // - - X---X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        row += `<td colspan="${this.XResolution}" class="xaxislabel" id="${this.GUID}-xlabel">${xLabel}</td>`;
                    }
                } else if(y === -1) {
                    if(x === -2) {
                    } else if(x === -1) {
                        // - - - - -
                        // - X - - -
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.YResolution === 1) {
                            row += `<td class="yaxis" id="${this.GUID}-xlabel">${xLabel}</td>`;
                        } else if(this.XResolution === 1) {
                            row += `<td class="xaxis" id="${this.GUID}-ylabel">${yLabel}</td>`;
                        } else {
                            row += `<td colspan="3" class="zlabel" id="${this.GUID}-zlabel">${zLabel}</td>`;
                        }
                    } else if(x === -2) {
                    } else if(x < this.XResolution) {
                        // - - - - -
                        // - - X X X
                        // - - - - -
                        // - - - - -
                        // - - - - -
                        if(this.XResolution === 1) {
                            row += `<td class="xaxis" id="${this.GUID}-zlabel">${zLabel}</td>`;
                        } else {
                            if((x === 0 && this.MinXModifiable) || (x === this.XResolution - 1 && this.MaxXModifiable))
                                row += `<td class="xaxis"><input class="number" id="${this.GUID}-${x}-axis" data-x="${x}" data-y="${y}" type="number" value="${parseFloat(parseFloat(((this.MaxX - this.MinX) * x / (this.XResolution-1) + this.MinX).toFixed(6)).toPrecision(7))}"/></td>`;
                            else
                                row += `<td class="xaxis"><div class="number" id="${this.GUID}-${x}-axis" data-x="${x}" data-y="${y}">${Table.FormatNumberForDisplay((this.MaxX - this.MinX) * x / (this.XResolution-1) + this.MinX)}</div></td>`;
                        }
                    } else {
                        if(this.XResolutionModifiable)
                            row += `<td class="col_expand" rowspan="${this.YResolution + (xstart === -1? 2 : 1)}"></td>`;
                    }
                } else if(y < this.YResolution) {
                    if(x === -2) {
                        if(y === 0){
                            // - - - - -
                            // - - - - -
                            // X - - - -
                            // | - - - -
                            // X - - - -
                            row += `<td rowspan="${this.YResolution}" style="width: auto;"></td><td rowspan="${this.YResolution}" class="yaxislabel"><div id="${this.GUID}-ylabel">${yLabel}</div></td>`;
                        }
                    } else if(x === -1) {
                        // - - - - -
                        // - - - - -
                        // - X - - -
                        // - X - - -
                        // - X - - -
                        if(this.YResolution === 1) {
                            row += `<td class="yaxis" id="${this.GUID}-zlabel">${zLabel}</td>`;
                        } else {
                            if((y === 0 && this.MinYModifiable) || (y === this.YResolution - 1 && this.MaxYModifiable))
                                row += `<td class="yaxis"><input class="number" id="${this.GUID}-axis-${y}"  data-x="${x}" data-y="${y}" type="number" value="${parseFloat(parseFloat(((this.MaxY - this.MinY) * y / (this.YResolution-1) + this.MinY).toFixed(6)).toPrecision(7))}"/></td>`;
                            else 
                                row += `<td class="yaxis"><div class="number" id="${this.GUID}-axis-${y}"  data-x="${x}" data-y="${y}">${Table.FormatNumberForDisplay((this.MaxY - this.MinY) * y / (this.YResolution-1) + this.MinY)}</div></td>`;
                        }
                    } else if(x < this.XResolution) {
                        // - - - - -
                        // - - - - -
                        // - - X X X
                        // - - X X X
                        // - - X X X
                        var valuesIndex = x + this.XResolution * y;
                        var inputId =  `${this.GUID}-${x}-${y}`;
                        row += `<td>${Table.FormatCellForDisplay(inputId, x, y, this.Value[valuesIndex])}</td>`;
                    }
                } else {
                    if(this.YResolutionModifiable && x == xstart) {
                        row += `<td></td><td></td><td class="row_expand" colspan="${this.XResolution - xstart-1}"></td>`;
                        if(this.XResolutionModifiable)
                            row += `<td class="rowcol_expand"></td>`;
                    }
                }
            }
            row += `</tr>`;
            table += row;
        }

        return table + `</table>`;
    }

    static FormatNumberForDisplay(number, precision = 6) {
        var ret = parseFloat(parseFloat(parseFloat(number).toFixed(precision -1)).toPrecision(precision));
        if(isNaN(ret))
            return `&nbsp;`;
        return ret;
    }
    
    static FormatCellForDisplay(id, x, y, value) {
        var rowClass = $(`#${id}`).attr(`class`)
        if(rowClass)
            rowClass = `class="${rowClass}"`;
        else
            rowClass = `class="number"`;
        
        x ??= $(`#${id}`).data(`x`);
        y ??= $(`#${id}`).data(`y`);
        value ??= $(`#${id}`).val();
        if(value === ``)
            value = $(`#${id}`).html();

        if(rowClass.indexOf("origselect") === -1)
            return `<div ${rowClass} id="${id}" data-x="${x}" data-y="${y}">${Table.FormatNumberForDisplay(value)}</div>`;
        return `<input ${rowClass} id="${id}" data-x="${x}" data-y="${y}" value="${Table.FormatNumberForDisplay(value)}" type="number"/>`;
    }

    Trail(x, y, z) {
        //TODO add trail
    }
}

var pastetype = `equal`;

function AttachPasteOptions() {
    DetachPasteOptions();
    $(document).on(`click.pasteoptions`, `#pasteoptions .paste-button`, function(){
        pastetype = $(this).data(`pastetype`);
        $(`#pasteoptions div`).removeClass(`selected`);
        $(`#pasteoptions div[data-pastetype="${pastetype}"`).addClass(`selected`);
    });
}

function DetachPasteOptions() {
    $(document).off(`click.pasteoptions`);
}

function GetPasteOptions() {
    return `<div style="display:inline-block; position: relative;"><div style="width: 150; position: absolute; top: -10; left: 32px;z-index:1">Paste Options</div>
    <div id="pasteoptions" class="container">
        <div data-pastetype="equal"       class="paste-button${pastetype==`equal`? ` selected` : ``         }" style="position: relative;"><h3>📋</h3><span>=</span></div>
        <div data-pastetype="add"         class="paste-button${pastetype==`add`? ` selected` : ``           }" style="position: relative;"><h3>📋</h3><span>+</span></div>
        <div data-pastetype="subtract"    class="paste-button${pastetype==`subtract`? ` selected` : ``      }" style="position: relative;"><h3>📋</h3><span>-</span></div>
        <div data-pastetype="multiply"    class="paste-button${pastetype==`multiply`? ` selected` : ``      }" style="position: relative;"><h3>📋</h3><span>x</span></div>
        <div data-pastetype="multiply%"   class="paste-button${pastetype==`multiply%`? ` selected` : ``     }" style="position: relative;"><h3>📋</h3><span>%</span></div>
        <div data-pastetype="multiply%/2" class="paste-button${pastetype==`multiply%/2`? ` selected` : ``   }" style="position: relative;"><h3>📋</h3><span><sup>%</sup>&frasl;<sub>2</sub></span></div>
    </div>
</div>`;
}

document.addEventListener(`dragstart`, function(e){
    if($(e.target).hasClass(`selected`) || $(e.target).hasClass(`row_expand`) || $(e.target).hasClass(`col_expand`))
        e.preventDefault();
});//disable dragging of selected items