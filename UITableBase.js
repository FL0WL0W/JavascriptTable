export default class UITableBase extends HTMLDivElement {
    get value() {
        return [...this._valueElement.children].map(x => x.value);
    }
    set value(value) {
        if(value === undefined)
            return;
        if(value.length !== this.xResolution * this.yResolution)
            return;
        let same = true;
        for(let i = 0; i < this._valueElement.children.length; i++){
            if((isNaN(this._valueElement.children[i].value) && isNaN(value[i])) || this._valueElement.children[i].value === value[i])
                continue;
            same = false;
            break;
        }
        if(same)
            return;
        for(let i = 0; i < this._valueElement.children.length; i++)
            this._valueElement.children[i].value = value[i];
        this.dispatchEvent(new Event(`change`, {bubbles: true}));
    }
    get saveValue() {
        return {
            Value: this.value,
            XAxis: this.xAxis,
            XResolution: this.xResolutionModifiable? this.xResolution : undefined,
            YAxis: this.yAxis,
            YResolution: this.yResolutionModifiable? this.yResolution : undefined,
        };
    }
    set saveValue(saveValue) {
        if(saveValue === undefined) 
            return;

        const xResolution = saveValue.XResolution ?? saveValue.Resolution;
        const maxX = saveValue.MaxX ?? saveValue.Max;
        const minX = saveValue.MinX ?? saveValue.Min;
        if(xResolution && maxX !== undefined && minX !== undefined && maxX !== null && minX !== null) {
            saveValue.XAxis = new Array(xResolution);
            const xAxisAdd = (maxX - minX) / (xResolution - 1);
            for(let x=0; x<xResolution; x++){
                saveValue.XAxis[x] = minX + xAxisAdd * x;
            }
        }
        if(saveValue.YResolution && saveValue.MaxY !== undefined && saveValue.MinY !== undefined && saveValue.MaxY !== null && saveValue.MinY !== null) {
            saveValue.YAxis = new Array(saveValue.YResolution);
            const yAxisAdd = (saveValue.MaxY - saveValue.MinY) / (saveValue.YResolution - 1);
            for(let y=0; y<saveValue.YResolution; y++){
                saveValue.YAxis[y] = saveValue.MinY + yAxisAdd * y;
            }
        }

        if(saveValue.XAxis !== undefined)
            this.xAxis = saveValue.XAxis;
        if(saveValue.YAxis !== undefined)
            this.yAxis = saveValue.YAxis;

        if(saveValue.Value !== undefined && Array.isArray(saveValue.Value))
            this.value = saveValue.Value;
    }
    get xResolution() {
        return Math.max(1, this._xAxisElement.children.length);
    }
    set xResolution(xResolution) {
        if(isNaN(xResolution) || xResolution === this._xAxisElement.children.length)
            return;

        const oldValue = this.value;
        let newValue = new Array(xResolution * this.yResolution);
        for(let x=0; x<xResolution; x++){
            for(let y=0; y<this.yResolution; y++){
                let oldValuesIndex = x + this.xResolution * y;
                let newValuesIndex = x + xResolution * y;
                if(x >= this.xResolution){
                    let newValuesIndexMinus1 = (x-1) + xResolution * y;
                    let newValuesIndexMinus2 = (x-2) + xResolution * y;
                    if(x>1){
                        newValue[newValuesIndex] = newValue[newValuesIndexMinus1] + (newValue[newValuesIndexMinus1] - newValue[newValuesIndexMinus2]);
                    }
                } else {
                    newValue[newValuesIndex] = oldValue[oldValuesIndex];
                }
                if(isNaN(newValue[newValuesIndex]))
                    newValue[newValuesIndex] = 0;
            }
        }
        if(this._xResolutionElement)
            this._xResolutionElement.value = xResolution;
        this._resolutionChanged(this._xAxisElement, xResolution);
        this.value = newValue;
        this.dispatchEvent(new Event(`change`, {bubbles: true}));
    }
    get xAxis() {
        return [...this._xAxisElement.children].map(x => x.value);
    }
    set xAxis(xAxis) {
        if(objectTester(this.xAxis, xAxis))
            return;
        this.xResolution = xAxis.length;
        const thisClass = this;
        xAxis.forEach(function(xAxisValue, xAxisIndex) { const xAxisElement = thisClass._xAxisElement.children[xAxisIndex]; xAxisElement.value = xAxisValue; });
        ///*TODO*/interpolation
        this.dispatchEvent(new Event(`change`, {bubbles: true}));
    }
    get yResolution() {
        return Math.max(1, this._yAxisElement.children.length);
    }
    set yResolution(yResolution) {
        if(isNaN(yResolution) || yResolution === this._yAxisElement.children.length)
            return;

        const oldValue = this.value;
        let newValue = new Array(this.xResolution * yResolution);
        for(let x=0; x<this.xResolution; x++){
            for(let y=0; y<yResolution; y++){
                let valuesIndex = x + this.xResolution * y;
                if(y >= this.yResolution){
                    let valuesIndexMinus1 = x + this.xResolution * (y-1);
                    let valuesIndexMinus2 = x + this.xResolution * (y-2);
                    if(y>1){
                        newValue[valuesIndex] = newValue[valuesIndexMinus1] + (newValue[valuesIndexMinus1] - newValue[valuesIndexMinus2]);
                    }
                } else {
                    newValue[valuesIndex] = oldValue[valuesIndex];
                }
                if(isNaN(newValue[valuesIndex]))
                    newValue[valuesIndex] = 0;
            }
        }
        if(this._yResolutionElement)
            this._yResolutionElement.value = yResolution;
        this._resolutionChanged(this._yAxisElement, yResolution);
        this.value = newValue;
        this.dispatchEvent(new Event(`change`, {bubbles: true}));
    }
    get yAxis() {
        return [...this._yAxisElement.children].map(x => x.value);
    }
    set yAxis(yAxis) {
        if(objectTester(this.yAxis, yAxis))
            return;
        this.yResolution = yAxis.length;
        const thisClass = this;
        yAxis.forEach(function(yAxisValue, yAxisIndex) { const yAxisElement = thisClass._yAxisElement.children[yAxisIndex]; yAxisElement.value = yAxisValue; });
        ///*TODO*/interpolation
        this.dispatchEvent(new Event(`change`, {bubbles: true}));
    }

    #selecting;
    get selecting() {
        return this.#selecting;
    }
    set selecting(selecting) {
        this.#selecting = selecting;
        this._valueElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this._xAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        this._yAxisElement.querySelectorAll(`.selected`).forEach(function(element) { element.classList.remove(`selected`) });
        if(selecting) {
            let elementArray = this._valueElement.children;
            if(isNaN(selecting.startX))
                elementArray = this._yAxisElement.children;
            if(isNaN(selecting.startY))
                elementArray = this._xAxisElement.children;
            for(let i=0; i<elementArray.length; i++) {
                let element = elementArray[i];
                if( Math.min(selecting.endX, selecting.startX) > parseInt(element.x) ||
                    Math.max(selecting.endX, selecting.startX) < parseInt(element.x) ||
                    Math.min(selecting.endY, selecting.startY) > parseInt(element.y) ||
                    Math.max(selecting.endY, selecting.startY) < parseInt(element.y)){
                    continue;
                }
                element.classList.add(`selected`); 
            };
        }
        this.dispatchEvent(new Event(`select`))
    }

    #valueMin
    get _valueMin() {
        return isNaN(this.#valueMin)? 18000000000000000000 : this.#valueMin;
    }
    set _valueMin(valueMin) {
        valueMin = parseFloat(valueMin);
        if(this.#valueMin === valueMin)
            return;
        this.#valueMin = valueMin;
        this.style.setProperty('--valuemin', valueMin);
    }
    #valueMax
    get _valueMax() {
        if(this.#valueMax - this.#valueMin === 0)
            return 1;
        return isNaN(this.#valueMax)? -9000000000000000000 : this.#valueMax;
    }
    set _valueMax(valueMax) {
        valueMax = parseFloat(valueMax);
        if(this.#valueMax === valueMax)
            return;
        this.#valueMax = valueMax;
        this.style.setProperty('--valuemax', valueMax);
    }
    _boundAxis(element) {
        if(element !== this._xAxisElement && element !== this._yAxisElement)
            return;
        let amin;
        let amax;
        if(element === this._xAxisElement) {
            amin=Math.max(this.selecting.endX, this.selecting.startX);
            amax=Math.max(this.selecting.endX, this.selecting.startX);
        } else {
            amin=Math.max(this.selecting.endY, this.selecting.startY);
            amax=Math.max(this.selecting.endY, this.selecting.startY);
        }

        let mima = element.children[amax].value;
        for(let a=amax+1; a<element.children.length; a++) {
            if(element.children[a].value < mima) 
                element.children[a].value = mima;
            mima = element.children[a].value;
        }
        mima = element.children[amin].value;
        for(let a=amin-1; a>=0; a--) {
            if(element.children[a].value > mima) 
                element.children[a].value = mima;
            mima = element.children[a].value;
        }
    }

    attachToTable(table) {
        const thisClass = this;
        table.addEventListener(`change`, function(){
            thisClass.xAxis = table.xAxis;
            thisClass.yAxis = table.yAxis;
            thisClass.value = table.value;
        });
        table.addEventListener(`select`, function() {
            thisClass.selecting = table.selecting;
        })
    }
}