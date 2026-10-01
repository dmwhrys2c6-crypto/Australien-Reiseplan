from html.parser import HTMLParser
from pathlib import Path
class Inspect(HTMLParser):
    def __init__(self): super().__init__(); self.stack=[]; self.ids={}; self.views=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id','').startswith('view-') and 'app-view' in a.get('class',''):
            assert not any('app-view' in x[1].get('class','') for x in self.stack), f'Nested view: {a["id"]}'
            self.views.append(a['id'])
        if a.get('id'):
            assert a['id'] not in self.ids, f'Duplicate DOM ID: {a["id"]}'
            self.ids[a['id']]=a
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.stack.append((tag,a))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag: self.stack=self.stack[:i]; break
check=Inspect();check.feed(Path('index.html').read_text())
assert len(check.views)==6
for identity, attrs in check.ids.items():
    if attrs.get('data-shared-id'):
        source=attrs['data-shared-id']
        assert source in check.ids and source != identity, f'Invalid shared display source: {identity}'
for required in ['manage-finance','manage-expenses','manage-activities','manage-bookings','manage-documents','memory-upload-form','manage-editor','manage-confirm']:
    assert required in check.ids, required
print('Management DOM: six independent views, unique integration IDs and all functional panels passed.')
