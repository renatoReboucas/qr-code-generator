'use client';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Share2, QrCode as QrCodeIcon, Wifi, Globe } from 'lucide-react';
import { toast } from 'sonner';

const QRCodeGenerator = () => {
  const [qrType, setQrType] = useState('website');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [size, setSize] = useState(256);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateQRValue = () => {
    if (qrType === 'website') {
      if (!websiteUrl.trim()) return '';
      // Adiciona https:// se não tiver protocolo
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        return `https://${websiteUrl}`;
      }
      return websiteUrl;
    } else if (qrType === 'wifi') {
      if (!wifiSsid.trim()) return '';
      // Formato WiFi: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
      return `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};H:false;;`;
    }
    return '';
  };

  const qrValue = generateQRValue();

  const downloadQRCode = () => {
    if (!qrValue) {
      toast.error("Por favor, preencha os campos necessários para gerar o QR code.");
      return;
    }

    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = size;
      canvas.height = size;

      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `qrcode-${qrType}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        toast.success("O QR code está sendo baixado.");
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const copyToClipboard = async () => {
    if (!qrValue) {
      toast.error("Por favor, preencha os campos necessários para gerar o QR code.");
      return;
    }

    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (svg) {
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);

              toast.success("QR code copiado para a área de transferência.");
            }
          });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      } catch (error) {
        console.error("Erro ao copiar:", error);
        toast.error("Não foi possível copiar o QR code.");
      }
    }
  };

  const shareQRCode = async () => {
    if (!qrValue) {
      toast.error("Por favor, preencha os campos necessários para gerar o QR code.");
      return;
    }

    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (svg && navigator.share) {
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = size;
        canvas.height = size;

        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `qrcode-${qrType}.png`, { type: 'image/png' });
              await navigator.share({
                title: 'QR Code',
                text: `Confira este QR code para ${qrType === 'website' ? 'site' : 'Wi-Fi'}!`,
                files: [file]
              });
            }
          });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        toast.error("Compartilhamento não foi possível.");
      }
    } else {
      toast.error("Compartilhamento não suportado neste navegador.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <QrCodeIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gray-900">Gerador de QR Code</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Crie QR codes para sites ou redes Wi-Fi instantaneamente.
          Escolha o tipo e preencha as informações necessárias.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCodeIcon className="h-5 w-5" />
              <span>Configurações</span>
            </CardTitle>
            <CardDescription>
              Configure seu QR code personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={qrType} onValueChange={setQrType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="website" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Site</span>
                </TabsTrigger>
                <TabsTrigger value="wifi" className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <span>Wi-Fi</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="website" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website-url">URL do Site</Label>
                  <Input
                    id="website-url"
                    placeholder="exemplo.com ou https://exemplo.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wifi-ssid">Nome da Rede (SSID)</Label>
                  <Input
                    id="wifi-ssid"
                    placeholder="MinhaRedeWiFi"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifi-password">Senha</Label>
                  <Input
                    id="wifi-password"
                    type="password"
                    placeholder="SenhaDoWiFi"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifi-security">Tipo de Segurança</Label>
                  <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">Sem senha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size-select">Tamanho</Label>
                <Select value={size.toString()} onValueChange={(value) => setSize(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128x128</SelectItem>
                    <SelectItem value="256">256x256</SelectItem>
                    <SelectItem value="512">512x512</SelectItem>
                    <SelectItem value="1024">1024x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="error-correction">Correção de Erro</Label>
                <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Baixa (7%)</SelectItem>
                    <SelectItem value="M">Média (15%)</SelectItem>
                    <SelectItem value="Q">Alta (25%)</SelectItem>
                    <SelectItem value="H">Muito Alta (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>
              Seu QR code aparecerá aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                  {isMounted ? (
                    qrValue ? (
                      <div id="qr-code">
                        <QRCodeSVG
                          value={qrValue}
                          size={size}
                          level={errorCorrection as 'L' | 'M' | 'Q' | 'H'}
                          includeMargin={true}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 space-y-2 w-64 h-64">
                        {qrType === 'website' ? (
                          <Globe className="h-16 w-16" />
                        ) : (
                          <Wifi className="h-16 w-16" />
                        )}
                        <p className="text-sm text-center">
                          {qrType === 'website'
                            ? 'Digite uma URL para gerar o QR code'
                            : 'Preencha os dados do Wi-Fi para gerar o QR code'
                          }
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 space-y-2 w-64 h-64">
                      <p>Carregando...</p>
                    </div>
                  )}
                </div>
              </div>

              {isMounted && qrValue && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareQRCode}
                    className="flex items-center space-x-1"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Dicas de Uso
        </h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <div>
            <strong>Para Sites:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• URLs serão automaticamente prefixadas com https:// se necessário</li>
              <li>• Teste sempre o QR code antes de usar publicamente</li>
            </ul>
          </div>
          <div>
            <strong>Para Wi-Fi:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• O QR code permitirá conexão automática à rede</li>
              <li>• Funciona na maioria dos smartphones modernos</li>
              <li>• Use WPA/WPA2 para redes seguras</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;