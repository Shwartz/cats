let testA = ()=>`<!--
There is quick pattern for basic Progressive web apps.
No frameworks, just some helpers for basic patterns.
Service workers will manipulate data, Only DOM manipulation logic will be there.
Animations CSS.
Because of service workers, we will reload page instead of keepin all scripts in single page.
-->
<!--Global Initialisation-->
<script src="dist/main.js"></script>

<script>
    (root => {
        let {Mediator, swRun} = root.utils;
        /*Global is only eventBus, everything else we handle locally*/
        swRun();
        root.utils.evtBus = new Mediator();
    })(window)
</script>
<p>
    <button class="oneContent">One Content testA</button>
    <button class="anotherContent">Another Content testA</button>
    <!--Below each our related element group we will add related script-->
    <script>
        (root => {
            //Of course, this is just dummy data, real data, will come with fetch from service workers.
            let data = {
                oneData:     [
                    {
                        name:  'foo',
                        price: 21
                    }, {
                        name:  'bar',
                        price: 22
                    }, {
                        name:  'baz',
                        price: 23
                    }
                ],
                anotherData: [
                    {
                        name:  'fooA',
                        price: 212
                    }, {
                        name:  'barA',
                        price: 222
                    }, {
                        name:  'bazA',
                        price: 232
                    }
                ]
            };
            let {DOM, evtBus} = root.utils,
                {container} = DOM;

            let oneContent = container('.oneContent'),
                anotherContent = container('.anotherContent');

            oneContent.on('click', () => evtBus.publish('content', data['oneData']));
            anotherContent.on('click', () => evtBus.publish('content', data['anotherData']));
        })(window)
    </script>
    Clicked item price:
    <strong class="placeholderName"></strong>
    <span class="placeholderPrice"></span>
    <script>
        (root => {
            let {DOM, evtBus} = root.utils,
                {container} = DOM;

            let placeholderName = container('.placeholderName'),
                placeholderPrice = container('.placeholderPrice');
            evtBus.subscribe('addName', (innerText) => placeholderName.addTemplate(innerText));
            evtBus.subscribe('addPrice', (innerText) => placeholderPrice.addTemplate(innerText));

        })(window)
    </script>
</p>

<ul class="content"></ul>
<script>
    ((root) => {
        //Just basic template to covert Array to list
        let template = (data) => data.map(item => \`<li><strong class="name">\${item.name}</strong> :<span class="price">\${item.price}</span></li>\`).join('\\n');
        // Initialise Mediator and define useful variables
        let {DOM, evtBus} = root.utils,
            {container, select} = DOM;

        //Create Container by using selector. Currently selector is global, there is some ways, to compose them, and use as locals
        let content = container('.content');

        //Subscribe to global eventBus, and apply data as string to container
        evtBus.subscribe('content', (resp) => content.addTemplate(template(resp)));

        // There is interesting, We subscribe one click event to parent container.
        // Means, we not need add and remove events on content changes.
        // Base on event target, we publishing different contents. There also can use childNode index etc.
        let addName = select('.name', (el) => evtBus.publish('addName', el.innerText)),
            addPrice = select('.price', (el) => evtBus.publish('addPrice', el.innerText));

        content.on('click', e => {
            //Selecting parent Node on event Target
            let parent = e.target.parentNode;
            //Applying initialised functions above.
            addName(parent);
            addPrice(parent);
        });
    })(window)
</script>`;

export {testA}