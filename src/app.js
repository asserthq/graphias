console.log(window);

var all;
var selected;
var graph;
var converted;
var type = null;

var uploadedCSV;

ggraph.init('container', 25);

var merge = () => {
    ggraph.merge(selection.all());
}

var remove = () => {
    var s = [];
    for (var k in selected) {
    s.push({id: k})
    }
    ggraph.remove(s);
}

var split = () => {
    ggraph.split(all);
}

function _singles(e) {
    var groups = singles.get_groups(converted);
    all = groups;
    ggraph.merge(groups);
};

function _backbones(e) {
    var res = simmelian.filter(converted.all_links, 0.75);
    ggraph.filter_links(res);
};

function _set_comment() {
    if (selection.all().length === 0) return;
    var comment = document.getElementById('comment').value;
    var mock = ggraph.convert({
    nodes: [{id: comment, type: 'comment'}],
    links: []
    });

    var original = ggraph.get_graph();
    var comment_obj = mock.nodes[0];

    original.nodes.push(comment_obj);

    for (var key in mock.member_map) {
    original.member_map[key] = mock.member_map[key];
    }

    for (var key in mock.group_map) {
    original.group_map[key] = original.nodes.length - 1;
    }

    document.getElementById('comment').value = '';

    original.all_links[comment] = {}

    var tx = 0;
    var ty = 0;

    selection.all().map(function(selected) {
    var group_id = original.member_map[selected.id].group;
    var target = original.nodes[original.group_map[group_id]];
    tx += target.x;
    ty += target.y;

    original.all_links[comment][selected.id] = 1;
    original.links.push({
        source: comment_obj,
        target: target,
        value: 1
    })
    });

    comment_obj.x = tx / selection.all().length;
    comment_obj.y = ty / selection.all().length;

    ggraph.draw(original);

    selection.clear();
}

function clear_graph() {
    const empty = {
        all_links: [],
        nodes: [],
        links: []
    };
    document.getElementById('node-count').innerHTML = 0;
    document.getElementById('edge-count').innerHTML = 0;

    ggraph.draw(empty);
    console.log("Empty graph drawed");
}

function draw_graph() {
    graph = csv_to_graph(uploadedCSV);

    document.getElementById('node-count').innerHTML = graph.nodes.length;
    document.getElementById('edge-count').innerHTML = graph.links.length;

    converted = ggraph.convert(graph);
    console.log("Converted graph data:");
    console.log(converted);

    ggraph.draw(converted);
}

const fileUploader = document.getElementById('file-uploader');
fileUploader.addEventListener('change', (event) => {
    const files = event.target.files;
    console.log("Uploaded files:");
    console.log(files);

    read_graph_data(files[0], (csvStr) => {
        uploadedCSV = csvStr;
    });
});

function read_graph_data(file, callback) {
    const reader = new FileReader();
    reader.onload = () => {
        console.log(`File contents:\n${reader.result}`);
        callback(reader.result);
    };

    reader.onerror = () => {
        console.log(`Reading file error:\n${reader.error}`);
        callback("");
    };

    reader.readAsText(file);
}

function csv_to_graph(csv_str) {

    let separator;
    if (csv_str.slice(0, Math.min(100, csv_str.length)).includes(';')) {
        separator = ';'
    } else {
        separator = ','
    }
    console.log(`Selected CSV separator: \'${separator}\'`);

    let mat = $.csv.toArrays(csv_str, { separator });

    console.log("CSV parse input:");
    console.log(csv_str);
    console.log("CSV parse output:");
    console.log(mat);

    let nodes = [];
    let links = [];

    if (mat[0][0] == "*") {

        console.log("Selected mode: with node labels")
        mat.slice(1, mat.length).forEach((row, ri) => {
            nodes.push({ id: row[0].toString() });
            console.log({ id: row[0].toString() });
            row.slice(1, mat.length).forEach((val, ci) => {
                if (ri != ci && val != 0) {
                    links.push({
                        source: mat[ri+1][0].toString(),
                        target: mat[0][ci+1].toString(),
                        value: 500
                    });
                }
            });
        });

    } else {

        console.log("Selected mode: without node labels, label = index")
        mat.forEach((row, ri) => {
            nodes.push({ id: ri.toString() });
            row.slice(0, mat.length).forEach((val, ci) => {
                if (ri != ci && val != 0) {
                    links.push({
                        source: ri.toString(), 
                        target: ci.toString()
                    });
                }
            });
        });
    }

    console.log("Created graph nodes:");
    console.log(nodes);
    console.log("Created graph edges:");
    console.log(links);

    return { nodes, links };
}

ggraph.on_select(function(_all, _selected) {
    all = selection.all();
    selected = selection.selected();
});

// var graph = {
//     nodes:[
//         {id: "Maria West", type: "female"},
//         {id: "Hazel Santiago", type: "male"},
//         {id: "Sheldon Roy", type: "male"},
//         {id: "Tracey Martinez", type: "female"},
//         {id: "Warren Mcgee", type: "male"},
//         {id: "Donnie Ballard", type: "female"},
//         {id: "Jackie Snyder", type: "female"},
//         {id: "Robin Luna", type: "male"},
//         {id: "Verna Bailey", type: "female"},
//         {id: "Donni Ballard", type: "female"},
//         {id: "Paal Hansen", type: "male"},
//         {id: "Shane	Simpson", type: "male"},
//         {id: "Robyn Luna", type: "male"},
//         {id: "Penny	Marsh", type: "female"},
//     ],
//     links: [
//         {source: "Maria West", target: "Hazel Santiago", value:100},
//         {source: "Maria West", target: "Sheldon Roy"},
//         {source: "Hazel Santiago", target: "Sheldon Roy"},
//         {source: "Maria West", target: "Tracey Martinez"},
//         {source: "Maria West", target: "Warren Mcgee"},
//         {source: "Hazel Santiago", target: "Tracey Martinez"},
//         {source: "Hazel Santiago", target: "Warren Mcgee"},
//         {source: "Sheldon Roy", target: "Tracey Martinez"},
//         {source: "Sheldon Roy", target: "Warren Mcgee"},
//         {source: "Tracey Martinez", target: "Warren Mcgee"},
//         {source: "Sheldon Roy", target: "Donnie Ballard"},
//         {source: "Donnie Ballard", target: "Jackie Snyder"},
//         {source: "Donnie Ballard", target: "Robin Luna"},
//         {source: "Jackie Snyder", target: "Robin Luna"},
//         {source: "Robin Luna", target: "Verna Bailey"},
//         {source: "Donni Ballard", target: "Verna Bailey"},
//         {source: "Maria West", target: "Verna Bailey"},
//         {source: "Paal Hansen", target: "Verna Bailey"},

//         {source: "Shane	Simpson", target: "Robyn Luna"},
//         {source: "Shane	Simpson", target: "Penny	Marsh"},
//         {source: "Penny	Marsh", target: "Robyn Luna"}
//     ]
// }

// document.getElementById('node-count').innerHTML = graph.nodes.length;
// document.getElementById('edge-count').innerHTML = graph.links.length;

// converted = ggraph.convert(csv_to_graph("1;0;1;0\n1;1;0;0\n0;1;1;0\n0;0;1;1\n"));

// ggraph.draw(converted);