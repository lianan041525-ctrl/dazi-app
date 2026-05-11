'use client';
import { useState } from 'react';
import { useCityStore } from '@/lib/store';

const PROVINCES: Record<string, string[]> = {
  '北京': ['北京'],
  '上海': ['上海'],
  '天津': ['天津'],
  '重庆': ['重庆'],
  '广东': ['广州','深圳','东莞','佛山','珠海','惠州','中山','汕头','江门','湛江','茂名','肇庆','韶关','潮州','揭阳','梅州','清远','阳江','云浮','河源','汕尾'],
  '四川': ['成都','遂宁','南充','绵阳','德阳','宜宾','泸州','自贡','攀枝花','内江','乐山','眉山','资阳','雅安','广安','达州','巴中','广元','康定'],
  '浙江': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
  '江苏': ['南京','苏州','无锡','常州','南通','扬州','镇江','泰州','盐城','连云港','淮安','宿迁','徐州'],
  '山东': ['济南','青岛','烟台','潍坊','临沂','淄博','济宁','泰安','威海','日照','东营','德州','聊城','滨州','菏泽'],
  '湖北': ['武汉','宜昌','襄阳','黄石','十堰','荆州','荆门','孝感','黄冈','咸宁','随州','恩施'],
  '湖南': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
  '河南': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店'],
  '河北': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
  '陕西': ['西安','铜川','宝鸡','咸阳','渭南','延安','汉中','榆林','安康','商洛'],
  '福建': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
  '安徽': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','六安','亳州','池州','宣城'],
  '辽宁': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
  '黑龙江': ['哈尔滨','齐齐哈尔','鸡西','鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化'],
  '吉林': ['长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
  '山西': ['太原','大同','阳泉','长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁'],
  '贵州': ['贵阳','六盘水','遵义','安顺','毕节','铜仁','黔西南','黔东南','黔南'],
  '云南': ['昆明','曲靖','玉溪','保山','昭通','丽江','普洱','临沧','楚雄','红河','文山','西双版纳','大理','德宏','怒江','迪庆'],
  '广西': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','贺州','河池','来宾','崇左'],
  '江西': ['南昌','景德镇','萍乡','九江','新余','鹰潭','赣州','吉安','宜春','抚州','上饶'],
  '海南': ['海口','三亚','三沙','儋州','五指山','琼海','文昌','万宁','东方'],
  '甘肃': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南','临夏','甘南'],
  '新疆': ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博乐','库尔勒','阿克苏','喀什','和田','伊宁','塔城','阿勒泰'],
  '内蒙古': ['呼和浩特','包头','乌海','赤峰','通辽','鄂尔多斯','呼伦贝尔','巴彦淖尔','乌兰察布'],
  '宁夏': ['银川','石嘴山','吴忠','固原','中卫'],
  '青海': ['西宁','海东','海北','黄南','海南','果洛','玉树','海西'],
  '西藏': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台北','高雄','台中','台南','桃园','新竹','基隆'],
};

export default function CitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { city, setCity } = useCityStore();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  if (!open) return null;

  const choose = (c: string) => {
    setCity(c);
    onClose();
    setSelectedProvince(null);
  };

  const provinces = Object.keys(PROVINCES);

  return (
    <div className="fixed inset-0 z-50" onClick={() => { onClose(); setSelectedProvince(null); }}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] rounded-t-3xl flex flex-col"
        style={{ background: '#1A1530', border: '0.5px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="text-center text-white font-semibold py-4 shrink-0">
          {selectedProvince ? (
            <div className="flex items-center px-4">
              <button onClick={() => setSelectedProvince(null)} className="text-white/50 text-sm mr-2">←</button>
              <span className="flex-1">{selectedProvince} · 选择城市</span>
            </div>
          ) : '选择省份'}
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {!selectedProvince ? (
            <div className="grid grid-cols-4 gap-2">
              {provinces.map(p => (
                <button key={p} onClick={() => {
                    if (PROVINCES[p].length === 1) { choose(PROVINCES[p][0]); }
                    else { setSelectedProvince(p); }
                  }}
                  className="py-2.5 rounded-xl text-sm transition"
                  style={{
                    background: PROVINCES[p].some(c => c === city) ? 'linear-gradient(135deg,#FF5E78,#6C5CE7)' : 'rgba(255,255,255,0.05)',
                    color: PROVINCES[p].some(c => c === city) ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: '0.5px solid rgba(255,255,255,0.06)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {PROVINCES[selectedProvince].map(c => (
                <button key={c} onClick={() => choose(c)}
                  className="py-2.5 rounded-xl text-sm transition"
                  style={{
                    background: city === c ? 'linear-gradient(135deg,#FF5E78,#6C5CE7)' : 'rgba(255,255,255,0.05)',
                    color: city === c ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: '0.5px solid rgba(255,255,255,0.06)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => { onClose(); setSelectedProvince(null); }}
          className="mx-4 mb-6 py-3 rounded-xl text-sm text-white/50 shrink-0"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          取消
        </button>
      </div>
    </div>
  );
}
