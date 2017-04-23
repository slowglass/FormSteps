declare var jQuery: any;
declare var $: any;
declare var setTimeout: any;
declare var d3: any;

function step(obj) {
    FormDisplay.step(obj);
}


class FormDisplay {
    private static readonly DISPLAY_ALL: number = -1;
    private static readonly DISPLAY_MERGED: number = -2;
    private static readonly offset: number = 15;
    private static readonly sqSize: number = 60;
    private static steps: Array<Step> = [];
    private static currentStep: Step = null;

    static step(obj) {
        var newStep: Step;
        if (FormDisplay.currentStep == null) {
            var left: Foot = Foot.fromCode(obj.leftStart, Side.LEFT);
            var right: Foot = Foot.fromCode(obj.rightStart, Side.RIGHT);
            newStep = new Step(obj.name, obj.desc, left, right);
        } else {
            newStep = FormDisplay.currentStep.move(obj.name, obj.desc, obj.left, obj.right);
        }
        FormDisplay.steps.push(newStep);
        FormDisplay.currentStep = newStep;
    }

    static displayStep() {
        var displayType = "single";
        $("#contents").html("");
        FormDisplay.addButtons("#contents", displayType);
        $("#contents").append("<div id='" + displayType + "'><div  style='clear: both;'><h3 class='title'>&nbsp;</h3></div></div>");
        $("#" + displayType).append("<div style='float: left bottom;'><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
        FormDisplay.showStep("#" + displayType, 0, FormDisplay.DISPLAY_ALL);
    }
    /*
    static displayMerged()
    {
        var displayType = "merged";
        $("#contents").html("");
        FormDisplay.addButtons("#contents", displayType);
        $("#contents").append("<div id='" + displayType + "'><div  style='clear: both;'><h3 class='title'>&nbsp;</h3></div></div>");
        $("#"+displayType).append("<div style='float: left bottom;'><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
        FormDisplay.showStep("#" + displayType, 0, FormDisplay.DISPLAY_MERGED);
    }
    
    static displayAll() {
        var fullSteps = [];
        $("#contents").html("");
        FormDisplay.addButtons("#contents", "all");

        var title = "";
        for (var i = 0; i < FormDisplay.steps.length; i++) {
            var s = FormDisplay.steps[i];
            var id = "step_" + i;

            if (title != s.name)
                $("#contents").append("<div  style='clear: both;'><h3 class='title'>" + s.name + "</h3></div>");
            
            $("#contents").append("<div style='float: left;' id='" + id + "'></div>");
            $("#"+id).append("<div ><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
            FormDisplay.showStep("#" + id, i, FormDisplay.DISPLAY_ALL);
            title = s.name;
        }
    }

    static displaySummary() {
        var fullSteps = [];
        $("#contents").html("");
        FormDisplay.addButtons("#contents", "summary");
        var title = "";
        var label = "";
        for (var i = 0; i < FormDisplay.steps.length; i++) {
            var s = FormDisplay.steps[i];
            var id = "step_" + i;

            if (title != s.name)
                $("#contents").append("<div  style='clear: both;'><h3 class='title'>" + s.name + "</h3></div>");
            
            if (label != s.label) {
                fullSteps.push(i);
                if (fullSteps.length > 5) fullSteps.shift();
            }
            $("#contents").append("<div style='float: left;' id='" + id + "'></div>");
            $("#"+id).append("<div ><div class='desc'>&nbsp;</div><div class='svg'></div></div>");
            var lastStep = fullSteps[0];
            FormDisplay.showStep("#"+id, i, lastStep);
            title = s.name;
            label = s.label;
        }
    }
    */
    static addButtons(id, current) {
        var buttons = "<div id='buttons' style='clear: both;'>";

        if (current == "single") buttons += "<button class='button' id='prevStep'>Previous</button>";
        if (current == "single") buttons += "<button class='button' id='nextStep'>Next</button>";
        if (current == "single") buttons += "<button class='button' id='runAll'>Run All</button>";


        if (current != "single") buttons += "<button class='button' id='showStep'>Show Single Step</button>";
        if (current != "summary") buttons += "<button class='button' id='showSummary'>Show Summary</button>";
        if (current != "all") buttons += "<button class='button' id='showAll'>Show All</button>";
        if (current != "merged") buttons += "<button class='button' id='showMerged'>Show Merged</button>";

        buttons += "</div>";

        $(id).append(buttons);
        $("#prevStep").click(function() { FormDisplay.showStep(id, FormDisplay.currentStep.index - 1, FormDisplay.DISPLAY_ALL); });
        $("#nextStep").click(function() { FormDisplay.showStep(id, FormDisplay.currentStep.index + 1, FormDisplay.DISPLAY_ALL); });
        $("#runAll").click(function() { FormDisplay.runAll(0); });
        $("#showStep").click(function() { FormDisplay.displayStep(); });/*
        $("#showAll").click(function() { FormDisplay.displayAll(); });
        $("#showMerged").click(function() { FormDisplay.displayMerged(); });
        $("#showSummary").click(function() { FormDisplay.displaySummary(); });*/
    }

    static runAll(step: number) {
        if (step < 0) return;
        if (step >= FormDisplay.steps.length) return;
        setTimeout(function() { FormDisplay.runAll(step + 1); }, 500);
        FormDisplay.showStep("single", step, FormDisplay.DISPLAY_ALL);
    }

    static vis = null;

    static showStep(id: string, step: number, displayType: number) {
        if (step < 0) return;
        if (step >= FormDisplay.steps.length) return;

        var drawTo: number = (displayType == FormDisplay.DISPLAY_ALL || FormDisplay.DISPLAY_MERGED) ? FormDisplay.steps.length : step + 1;
        var drawFrom: number = (displayType == FormDisplay.DISPLAY_ALL || FormDisplay.DISPLAY_MERGED) ? 0 : displayType;
        //drawTo = step + 1;
        var s = FormDisplay.steps[drawFrom];
        var min: Point = s.square.bottomLeft;
        var max: Point = s.square.topRight;

        var squares: Set<Square> = new Set<Square>();
        for (var i = drawFrom + 1; i < drawTo; i++) {
            var cs: Step = FormDisplay.steps[i];
            squares.add(cs.square);
            min = Point.min(min, cs.square.bottomLeft);
            max = Point.max(max, cs.square.topRight);
        }

        var data: Array<Square> = new Array<Square>();
        squares.forEach(function(v) { data.push(v); });

        // Add SVG Node
        if (FormDisplay.vis == null) {
            FormDisplay.vis = d3.select(id + " div.svg").append("svg:svg");
            var rect = FormDisplay.vis.selectAll("rect.current").data([s]);
            rect.enter().append("svg:rect").classed("current", true);
        }

         FormDisplay.vis
            .attr("width", (max.x - min.x) * FormDisplay.sqSize + 2 * FormDisplay.offset)
            .attr("height", (max.y - min.y) * FormDisplay.sqSize + 2 * FormDisplay.offset);
        $(id + " div.svg").css({ "width": (max.x - min.x) * FormDisplay.sqSize + 2 * FormDisplay.offset });

               
        rect = FormDisplay.vis.selectAll("rect.fg").data(data);
        rect.exit().remove();
        rect.enter().insert("svg:rect", "rect.current").classed("fg", true);
        rect = FormDisplay.vis.selectAll("rect.fg").data(data);
        rect.attr("height", function(d: Square) { return FormDisplay.sqSize * (d.topRight.y - d.bottomLeft.y); })
            .attr("width", function(d: Square) { return FormDisplay.sqSize * (d.topRight.x - d.bottomLeft.x); })
            .attr("x", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.x - min.x); })
            .attr("y", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.y - min.y); });
       
        if (displayType != FormDisplay.DISPLAY_MERGED) {
            var s = FormDisplay.steps[step];
            rect = FormDisplay.vis.selectAll("rect.current").data([s.square]);
            rect.attr("height", function(d: Square) { return FormDisplay.sqSize * (d.topRight.y - d.bottomLeft.y); })
                .attr("width", function(d: Square) { return FormDisplay.sqSize * (d.topRight.x - d.bottomLeft.x); })
                .attr("x", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.x - min.x); })
                .attr("y", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.y - min.y); });

            $(id + " .title").html((s.name == null) ? "&nbsp;" : s.name);
            $(id + " .desc").html((s.desc == null) ? "&nbsp;" : s.desc);
            //s.displayStance(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'red', stroke: 'red', strokeWidth: 1 });
        }

        

    }

    
    static addBoundingRect(svg, min, max, style) {
        var c = Square.trans(max, min, FormDisplay.offset, FormDisplay.sqSize);
        //svg.rect(0, 0, c.x + FormDisplay.offset, c.y + FormDisplay.offset, style);
    }
    /*

    static drawIntro(svg: any, id: string, step: number, displayType: number) {
        var drawTo: number = (displayType == FormDisplay.DISPLAY_ALL || FormDisplay.DISPLAY_MERGED) ? FormDisplay.steps.length : step + 1;
        var drawFrom: number = (displayType == FormDisplay.DISPLAY_ALL || FormDisplay.DISPLAY_MERGED) ? 0 : displayType;

        var s = FormDisplay.steps[drawFrom];
        var min: Point = s.bottomLeft;
        var max: Point = s.topRight;

        for (var i = drawFrom + 1; i < drawTo; i++) {
            var cs = FormDisplay.steps[i];
            min = Point.min(min, cs.bottomLeft);
            max = Point.max(max, cs.topRight);
        }

        if (displayType != FormDisplay.DISPLAY_MERGED) drawTo--;
        FormDisplay.addBoundingRect(id, min, max, { fill: 'none', stroke: 'blue', strokeWidth: 1 });

        var vis = d3.select(id + " div.svg").append("svg:svg")
            .attr("width",  (max.y - min.y) * FormDisplay.sqSize + 2 * FormDisplay.offset)
            .attr("height", (max.x - min.x) * FormDisplay.sqSize + 2 * FormDisplay.offset);

        var rect = vis.selectAll("rect.bg").data(FormDisplay.steps).enter().append("svg:rect");
        rect.classed("bg", true).attr("height", function(d: Square) { return FormDisplay.sqSize * (d.topRight.y - d.bottomLeft.y); })
            .attr("width", function(d: Square) { return FormDisplay.sqSize * (d.topRight.x - d.bottomLeft.x); })
            .attr("x", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.x - min.x); })
            .attr("y", function(d: Square) { return FormDisplay.offset + FormDisplay.sqSize * (d.bottomLeft.y - min.y); });
        
        for (var i = drawFrom; i < drawTo; i++) {
            var cs = FormDisplay.steps[i];
            cs.display(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'lightgray', stroke: 'transparent', strokeWidth: 1 });
        }

        for (var i = drawFrom; i < drawTo; i++) {
            var cs = FormDisplay.steps[i];
            cs.display(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'transparent', stroke: 'darkgray', strokeWidth: 1 });
        }

        if (displayType != FormDisplay.DISPLAY_MERGED) {
            var s = FormDisplay.steps[step];
            s.display(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'lightgreen', stroke: 'darkgray', strokeWidth: 1 });
            s.displayStance(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'red', stroke: 'red', strokeWidth: 1 });
        }
        else {
            for (var i = drawFrom; i < drawTo; i++) {
                var s = FormDisplay.steps[i];
                s.displayStance(svg, min, FormDisplay.offset, FormDisplay.sqSize, { fill: 'red', stroke: 'red', strokeWidth: 1 });
            }
        }

        $(id + " div.svg svg").css({
            "height": (max.y - min.y) * FormDisplay.sqSize + 2 * FormDisplay.offset,
            "width": (max.x - min.x) * FormDisplay.sqSize + 2 * FormDisplay.offset
        });
        $(id).css({ "width": (max.x - min.x) * FormDisplay.sqSize + 2 * FormDisplay.offset });

        $(id + " .title").html((s.name == null) ? "&nbsp;" : s.name);
        $(id + " .desc").html((s.desc == null) ? "&nbsp;" : s.desc);
    }*/
}
    
