from django.test import TestCase, Client
from django.urls import reverse


class EnsembleViewTest(TestCase):
    def test_page_accessibility(self):
        """Тест доступности страницы загрузки изображений"""
        client = Client()
        url = reverse('ensemble')
        response = client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'core/upload.html')
        self.assertIn('form', response.context)
        
        # Проверка русского текста в шаблоне
        self.assertContains(response, "Загрузите изображение для анализа")
        self.assertContains(response, "Выберите изображение:")
        self.assertContains(response, "Анализировать")

        form = response.context['form']
        self.assertEqual(form.__class__.__name__, 'ImageUploadForm')
        self.assertIn('image', form.fields)
        
    