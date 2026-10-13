"""Construit data/geo.json depuis Natural Earth (domaine public).
Couches : far (vue Canada est, simplifiée) et near (région Montréal / Beauharnois, détaillée)."""
import json, sys, shapefile
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union

D = sys.argv[1]
FAR = box(-104, 36, -50, 60)
NEAR = box(-79.5, 43.3, -68.0, 48.3)
ROADS = box(-75.6, 44.6, -72.2, 46.2)

def rings(geom):
    out = []
    gs = getattr(geom, 'geoms', [geom])
    for g in gs:
        if g.is_empty: continue
        if g.geom_type == 'Polygon':
            out.append([[round(x, 4), round(y, 4)] for x, y in g.exterior.coords])
            for i in g.interiors:
                out.append([[round(x, 4), round(y, 4)] for x, y in i.coords])
        elif g.geom_type in ('LineString',):
            out.append([[round(x, 4), round(y, 4)] for x, y in g.coords])
        elif hasattr(g, 'geoms'):
            out += rings(g)
    return out

def load(path, clip, tol, filt=None):
    r = shapefile.Reader(path)
    flds = [f[0] for f in r.fields[1:]]
    res = []
    for sr in r.iterShapeRecords():
        rec = dict(zip(flds, sr.record))
        if filt and not filt(rec): continue
        g = shape(sr.shape.__geo_interface__)
        if not g.intersects(clip): continue
        g = g.intersection(clip).simplify(tol, preserve_topology=True)
        res.append((rec, g))
    return res

geo = {}
prov = load(f'{D}/ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces', FAR, 0.03,
            lambda r: r['adm0_a3'] in ('CAN', 'USA'))
geo['far_can'] = [rings(g) for r, g in prov if r['adm0_a3'] == 'CAN']
geo['far_usa'] = [rings(g) for r, g in prov if r['adm0_a3'] == 'USA']
geo['far_qc'] = [rings(g) for r, g in prov if r['name'] == 'Québec' or r['name'] == 'Quebec']
lakes = load(f'{D}/ne_10m_lakes/ne_10m_lakes', FAR, 0.03, lambda r: (r.get('scalerank') or 9) <= 2)
geo['far_lakes'] = [rings(g) for r, g in lakes]
riv = load(f'{D}/ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines', FAR, 0.02,
           lambda r: (r.get('scalerank') or 9) <= 3)
geo['far_rivers'] = [rings(g) for r, g in riv]
# near
provn = load(f'{D}/ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces', NEAR, 0.0015,
             lambda r: r['adm0_a3'] in ('CAN', 'USA'))
geo['near_land'] = [rings(g) for r, g in provn]
lk = load(f'{D}/ne_10m_lakes/ne_10m_lakes', NEAR, 0.0015)
geo['near_lakes'] = [rings(g) for r, g in lk]
rv = load(f'{D}/ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines', NEAR, 0.0015)
geo['near_rivers'] = [rings(g) for r, g in rv]
rd = load(f'{D}/ne_10m_roads/ne_10m_roads', ROADS, 0.001)
geo['near_roads'] = [rings(g) for r, g in rd]
for k, v in geo.items():
    print(k, len(v), sum(len(p) for f in v for p in f))
json.dump(geo, open(f'{D}/geo.json', 'w'), separators=(',', ':'))
