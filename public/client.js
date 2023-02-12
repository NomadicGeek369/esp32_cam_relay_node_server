const ws = new WebSocket('ws:///192.168.0.150:8999');

ws.addEventListener('open', (event) => {
    ws.send(JSON.stringify({
        'client': '8999',
        'operation': 'connecting',
        'data': {}
    }));
});

ws.onmessage = message => {
    let md = JSON.parse(message.data);

    for (const device in md.devices) {
		if (!document.querySelector('#' + device)) {
			document.querySelector('#main-wrapper')
				.appendChild(createElement('div',{ id: device, class: md.devices[device].class + ' item' }))
				.appendChild(createElement('h2',{ id: device + '-header', class: 'sensors-header' }, md.devices[device].display));
			document.querySelector('#'+device) 
				.appendChild(createElement('div',{ id:'wrap-' + device + '-image', class: 'image-wrapper' }))
				.appendChild(createElement('img',{ id:'img-' + device }));
			document.querySelector('#'+device)
				.appendChild(createElement('div',{ id:'wrap-' + device + '-commands' }));
		}
		
		if (md.devices[device].image) {
			document.querySelector('#img-' + device).src = "data:image/jpeg;base64," + md.devices[device].image;
		}

        if (md.devices[device].peripherals) {
            for (const [id, state] of Object.entries(md.devices[device].peripherals)) {
                if (!document.querySelector('#' + device + '-' + id)) {
                    document.querySelector('#wrap-' + device + '-commands')
                        .appendChild(createElement('div', { 
                            id: device + '-' + id, 
                            class: 'command-button'
                    })).appendChild(createElement('div',{ 
                        id: device + '-' + id + '-state',
                        class: 'on-off-icon',
                        'data-state': state
                    }));

                    document.querySelector('#' + device + '-' + id).addEventListener('click', function(e) {
                        ws.send(JSON.stringify({
                            'client' : '8999',
                            'operation' : 'command',
                            'command': {'recipient' : device, 'message' : { key: id, value: e.target.dataset.state == 1 ? 0 : 1 }}
                        }));
                    });
                } else {
                    // Has any state changed?
                    let element = document.querySelector('#' + device + '-' + id + '-state');

                    if (element && state != element.dataset.state) {
                        element.dataset.state = state;
                    }
                }
            }
        }
    }
}

const createElement = (e, a, i) => {
    if(typeof(e) === "undefined"){ return false; } 
    if(typeof(i) === "undefined"){ i = ""; }
    let el = document.createElement(e);
    if(typeof(a) === 'object') { for(let k in a) { el.setAttribute(k,a[k]); }}
    if(!Array.isArray(i)) { i = [i]; }
    for(let k = 0; k < i.length; k++) { if(i[k].tagName) { el.appendChild(i[k]); } else { el.appendChild(document.createTextNode(i[k])); }}
    return el;
}