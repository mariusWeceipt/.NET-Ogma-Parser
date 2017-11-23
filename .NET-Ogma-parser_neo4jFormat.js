var ogma = new Ogma({
    container: 'yourContainer'
});

//This part can be returned via an AJAX response
var dummyResults = [
    {
        "Values": {
            "a": {
                "Id": 36058,
                "Labels": ["Label1", "Label2"],
                "Properties": {
                    "p1": "value1",
                    "p2": "value2"
                }
            },
            "s": {
                "Id": 260109,
                "Labels": ["Label1", "Label3"],
                "Properties": {
                    "p3": "value3",
                    "p4": "value4"
                }
            },
            "rels": [
                {
                    "Id": 1076093,
                    "Type": "EdgeType",
                    "StartNodeId": 260109,
                    "EndNodeId": 36058,
                    "Properties": {
                        "p5": "value5",
                        "p6": "value6"
                    }
                }
            ]
        },
        "Keys": ["a", "s", "rels"]
    },
    {
        "Values": {
            "a": {
                "Id": 36058,
                "Labels": ["LegiFrance", "Article", "CDT", "Code"],
                "Properties": {
                    "nature": "ARTICLE",
                    "dateDebut": "2016-08-10",
                    "num": "L2325-35",
                    "dateFin": "2999-01-01",
                    "id": "LEGIARTI000033023148",
                    "etat": "VIGUEUR",
                    "coOccurrent": "700,L2323-15,L2325-36"
                }
            },
            "s": {
                "Id": 259757,
                "Labels": ["LegiFrance", "Sommaire", "CDT", "Code"],
                "Properties": {
                    "titre": "Sous-section 1 : Experts rémunérés par l'entreprise",
                    "id": "LEGISCTA000006195726"
                }
            },
            "rels": [
                {
                    "Id": 1076093,
                    "Type": "Sommaire",
                    "StartNodeId": 260109,
                    "EndNodeId": 36058,
                    "Properties": {
                        "dateDebut": "2016-08-10",
                        "dateFin": "2999-01-01"
                    }
                },
                {
                    "Id": 1074249,
                    "Type": "Sommaire",
                    "StartNodeId": 259757,
                    "EndNodeId": 260109,
                    "Properties": {
                        "dateDebut": "2008-05-01",
                        "dateFin": "2999-01-01"
                    }
                }
            ]
        },
        "Keys": ["a", "s", "rels"]
    }
];

function CreateGraph() {
    ParseQueryResults(JSON.parse(dummyResults)).then(graph => {
        return ogma.setGraph(graph);
    }).then(() => {
        console.log('Import done!');
    });
}

function ParseNode(n) {
    var node = {
        id: n.Id,
        data: {
            neo4jLabels: n.Labels,
            neo4jProperties: n.Properties
        }
    };
    return node;
}

function ParseEdge(e) {
    var edge = {
        id: e.Id,
        source: e.StartNodeId,
        target: e.EndNodeId,
        data: {
            neo4jType: e.Type,
            neo4jProperties: e.Properties
        }
    };
    return edge;
}

function ParseQueryResults(results) {
    return new Promise(resolve => {
        var nodes = [],
            edges = [];

        //Parse results
        $.each(results, function (index, result) {
            if (result === null) {
                return;
            }
            var values = result.Values;

            //Parse row
            $.each(values, function (_index, _value) {
                if (_value === null) {
                    return;
                }
                //Elements can be either single or array
                if (_value.constructor === Array) {
                    $.each(_value, function (j, v) {
                        if (v === null) {
                            return;
                        }
                        //It's a node
                        if (v.hasOwnProperty('Labels')) {
                            if (nodes.filter(n => n.id === v.Id).length === 0) {
                                nodes.push(ParseNode(v));
                            }
                        }
                        //It's an edge
                        else {
                            if (edges.filter(e => e.id === v.Id).length === 0) {
                                edges.push(ParseEdge(v));
                            }
                        }
                    });
                }
                else {
                    //It's a node
                    if (_value.hasOwnProperty('Labels')) {
                        if (nodes.filter(n => n.id === _value.Id).length === 0) {
                            nodes.push(ParseNode(_value));
                        }
                    }
                    //It's an edge
                    else {
                        if (edges.filter(e => e.id === _value.Id).length === 0) {
                            edges.push(ParseEdge(_value));
                        }
                    }
                }
            });
        });

        //Return graph
        var graph = { nodes: nodes, edges: edges };
        resolve(graph);
    });
}