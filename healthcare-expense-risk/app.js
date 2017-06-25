(function() {
    var renderChoropleth = function(node, popupFunc) {
        return new Datamap({
            element: node,
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

    var renderData = function(node, legendNode, captionNode, responseText, lumenKey, tooltipFn) {
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

        data.forEach(function(x) {
            var code = x['Country Code'];
            var colour = 'hsl(34.8, 98.2%, ' + x[lumenKey] + '%)';
            if (colourSet.indexOf(colour) === -1) {
                colourSet.push(colour);
            }
            reshape[code] = colour;
            valueMap[code] = tooltipFn(x);
        });

        var eWidth = legendNode.parentElement.getBoundingClientRect().width / colourSet.length;
        colourSet.forEach(function(c) {
            var e = document.createElement('td');
            e.style.backgroundColor = c;
            e.style.width = eWidth + 'px';
            legendNode.appendChild(e);
        });

        // colSpan="0" for dynamic size <td>?
        captionNode.setAttribute('colspan', colourSet.length);

        var absRiskMap = renderChoropleth(node, function(geography, data) {
            var value = valueMap[geography.id];
            if (!value) {
                value = 'N/a';
            }
            return '<div class="hoverinfo"><strong>' + geography.properties.name + ': ' + value + '</strong></div>';
        });

        absRiskMap.updateChoropleth(reshape);
        return null;
    };

    var xhrReq = function(endpoint, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', endpoint);
        xhr.onload = function() {
            if (xhr.status === 200) {
                return callback(xhr);
            }
            alert("Unable retrieve data");
        };
        xhr.send();
    };

    var initApplication = function() {
        xhrReq('dataset/amount_at_risk.json', function(xhr) {
            renderData(
                document.getElementById('absolute-risk'),
                document.getElementById("caption-row"),
                document.getElementById("caption-text"),
                xhr.responseText,
                'Luminosity',
                function(x) {
                    return '$' + x['Amount at Risk'].toFixed(2);
                }
            );
        });

        xhrReq('dataset/relative_risk.json', function(xhr) {
            renderData(
                document.getElementById('income-adj-risk'),
                document.getElementById("caption-row-ii"),
                document.getElementById("caption-text-ii"),
                xhr.responseText,
                'Post GDP Luminosity',
                function(x) {
                    return '';
                }
            );
        });
    };

    document.onreadystatechange = function() {
        if (document.readyState === "interactive") {
            initApplication();
        }
    };
}());