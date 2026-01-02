'use client';

import * as React from 'react';
import * as fabric from 'fabric';
import { useFabricCanvas } from '@/hooks/use-fabric-canvas';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, Plus, Trash2, Download, Type, 
  DollarSign, Image as ImageIcon, FileText
} from 'lucide-react';
import { exportAsImage } from '@/lib/utils/image-editor';
import { CanvasContainer } from './canvas-container';

export type MenuFormat = 'a4' | 'a5' | 'booklet';

const MENU_SIZES = {
  a4: { width: 210, height: 297, label: 'A4' },
  a5: { width: 148, height: 210, label: 'A5' },
  booklet: { width: 210, height: 297, label: 'Буклет A4' },
};

const mmToPx = (mm: number, dpi: number = 300) => {
  return Math.round((mm / 25.4) * dpi);
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

export function MenuEditor() {
  const toast = useToast();
  
  const [menuFormat, setMenuFormat] = React.useState<MenuFormat>('a4');
  const [restaurantName, setRestaurantName] = React.useState('Название ресторана');
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([
    { id: '1', name: 'Блюдо 1', description: 'Описание блюда', price: '500 ₽' },
  ]);
  const [currentSection, setCurrentSection] = React.useState('Основные блюда');

  const size = MENU_SIZES[menuFormat];
  const width = mmToPx(size.width);
  const height = mmToPx(size.height);

  const {
    canvasRef,
    canvas,
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFabricCanvas({ 
    width, 
    height,
    backgroundColor: '#ffffff',
  });

  React.useEffect(() => {
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.renderAll();
  }, [canvas, width, height]);

  const handleAddMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: 'Новое блюдо',
      description: 'Описание',
      price: '0 ₽',
    };
    setMenuItems([...menuItems, newItem]);
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleUpdateMenuItem = (id: string, field: keyof MenuItem, value: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleApplyMenu = () => {
    if (!canvas) return;
    
    // Очищаем canvas
    const objects = canvas.getObjects();
    objects.forEach(obj => canvas.remove(obj));
    
    // Заголовок ресторана
    const title = new fabric.IText(restaurantName, {
      left: width / 2,
      top: 50,
      originX: 'center',
      originY: 'center',
      fontSize: 42,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#1a1a1a',
    });
    canvas.add(title);

    // Секция
    const sectionTitle = new fabric.IText(currentSection, {
      left: 50,
      top: 120,
      originX: 'left',
      originY: 'center',
      fontSize: 28,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#333333',
    });
    canvas.add(sectionTitle);

    // Элементы меню
    let yPos = 180;
    menuItems.forEach((item, index) => {
      // Название блюда
      const nameText = new fabric.IText(item.name, {
        left: 50,
        top: yPos,
        originX: 'left',
        originY: 'top',
        fontSize: 22,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1a1a1a',
      });
      canvas.add(nameText);

      // Описание
      if (item.description) {
        const descText = new fabric.IText(item.description, {
          left: 50,
          top: yPos + 35,
          originX: 'left',
          originY: 'top',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#666666',
          width: width - 200,
        });
        canvas.add(descText);
      }

      // Цена
      const priceText = new fabric.IText(item.price, {
        left: width - 50,
        top: yPos,
        originX: 'right',
        originY: 'top',
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#1a1a1a',
      });
      canvas.add(priceText);

      // Разделитель
      const divider = new fabric.Line([50, yPos + 80, width - 50, yPos + 80], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      canvas.add(divider);

      yPos += 100;
    });

    canvas.renderAll();
    saveHistory();
  };

  const handleExport = () => {
    if (!canvas) return;
    exportAsImage(canvas, 'png', `menu-${Date.now()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Боковая панель */}
      <div className="w-80 bg-background border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Редактор меню</h2>
          <p className="text-sm text-muted-foreground">Создавайте меню и каталоги</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Формат</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={menuFormat} onChange={(e) => setMenuFormat(e.target.value as MenuFormat)}>
                <option value="a4">A4</option>
                <option value="a5">A5</option>
                <option value="booklet">Буклет A4</option>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ресторан</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Название ресторана"
              />
              <Input
                value={currentSection}
                onChange={(e) => setCurrentSection(e.target.value)}
                placeholder="Название секции"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Блюда</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleAddMenuItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg space-y-2">
                  <Input
                    value={item.name}
                    onChange={(e) => handleUpdateMenuItem(item.id, 'name', e.target.value)}
                    placeholder="Название блюда"
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleUpdateMenuItem(item.id, 'description', e.target.value)}
                    placeholder="Описание"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={item.price}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'price', e.target.value)}
                      placeholder="Цена"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMenuItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="default" className="w-full" onClick={handleApplyMenu}>
                <FileText className="mr-2 h-4 w-4" />
                Применить меню
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">История</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={undo} disabled={!canUndo}>
                Отменить
              </Button>
              <Button variant="outline" className="w-full" onClick={redo} disabled={!canRedo}>
                Повторить
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Экспорт</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Экспорт PNG
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-8 overflow-auto">
        <div className="bg-white shadow-2xl">
          <CanvasContainer
            canvasRef={canvasRef}
            canvasWidth={width}
            canvasHeight={height}
            showGrid={false}
            onToggleGrid={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

