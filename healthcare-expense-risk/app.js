var renderChoropleth = function(popupFunc) {
    return new Datamap({
        element: document.getElementById('absolute-risk'),
        projection: 'mercator',
        animate: true,
        fills: {
            defaultFill: '#f0ebe4'
        },
        geographyConfig: {
            popupTemplate: popupFunc
        }
    });
};

var renderAbsoluteRisk = function(responseText) {
    var data = null;
    var reshape = {};
    var valueMap = {};

    try {
        data = JSON.parse(responseText);
    } catch (e) {
        alert('Unable to parse JSON data');
        return null;
    }

    // Use ES6 Set?
    var colourSet = [];
    var captionRow = document.getElementById("caption-row");

    data.forEach(function(x) {
        var code = x['Country Code'];
        var colour = 'hsl(34.8, 98.2%, ' + x.Luminosity + '%)';
        if (colourSet.indexOf(colour) === -1) {
            colourSet.push(colour);
        }
        reshape[code] = colour;
        valueMap[code] = '$' + x['Amount at Risk'].toFixed(2);
    });

    var eWidth = captionRow.parentElement.getBoundingClientRect().width / colourSet.length;
    colourSet.forEach(function(c) {
        var e = document.createElement('td');
        e.style.backgroundColor = c;
        e.style.width = eWidth + 'px';
        captionRow.appendChild(e);
    });

    // colSpan="0" for dynamic size <td>?
    document.getElementById('caption-text').colSpan = colourSet.length;

    var absRiskMap = renderChoropleth(function(geography, data) {
        var value = valueMap[geography.id];
        if (!value) {
            value = 'N/a';
        }
        return '<div class="hoverinfo"><strong>' + geography.properties.name + ': ' + value + '</strong></div>';
    });

    absRiskMap.updateChoropleth(reshape);
    return null;
};

(function() {
    var initApplication = function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'dataset/amount_at_risk.json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                return renderAbsoluteRisk(xhr.responseText);
            }
            alert("Unable retrieve data");
        };
        xhr.send();
    };

    document.onreadystatechange = function() {
        if (document.readyState === "interactive") {
            initApplication();
        }
    };
}());