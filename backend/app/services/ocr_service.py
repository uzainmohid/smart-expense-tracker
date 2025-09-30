"""
Smart Expense Tracker - OCR Service
Optical Character Recognition for receipt processing
"""

import cv2
import pytesseract
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import re
import os
from datetime import datetime
import logging

class OCRService:
    """Service for extracting text and data from receipt images"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Configure Tesseract path if needed
        tesseract_cmd = os.environ.get('TESSERACT_CMD')
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def preprocess_image(self, image_path):
        """Preprocess image for better OCR results"""
        try:
            # Read image using OpenCV
            image = cv2.imread(image_path)

            # Convert to RGB (PIL uses RGB, OpenCV uses BGR)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Convert to PIL Image for preprocessing
            pil_image = Image.fromarray(image)

            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.5)

            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(pil_image)
            pil_image = enhancer.enhance(2.0)

            # Convert back to OpenCV format
            image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)

            # Apply adaptive thresholding
            threshold = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )

            # Morphological operations to clean up the image
            kernel = np.ones((1, 1), np.uint8)
            processed = cv2.morphologyEx(threshold, cv2.MORPH_CLOSE, kernel)
            processed = cv2.morphologyEx(processed, cv2.MORPH_OPEN, kernel)

            return processed

        except Exception as e:
            self.logger.error(f"Error preprocessing image: {e}")
            # Return original image if preprocessing fails
            return cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    def extract_text(self, image_path):
        """Extract text from image using OCR"""
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image_path)

            # Configure Tesseract
            config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$:-() '

            # Extract text
            text = pytesseract.image_to_string(processed_image, config=config)

            return text.strip()

        except Exception as e:
            self.logger.error(f"Error extracting text from image: {e}")
            return ""

    def extract_receipt_data(self, image_path):
        """Extract structured data from receipt"""
        raw_text = self.extract_text(image_path)

        if not raw_text:
            return {
                'raw_text': '',
                'merchant_name': None,
                'total_amount': None,
                'date': None,
                'items': [],
                'confidence_score': 0.0
            }

        # Extract structured information
        extracted_data = {
            'raw_text': raw_text,
            'merchant_name': self._extract_merchant_name(raw_text),
            'total_amount': self._extract_total_amount(raw_text),
            'date': self._extract_date(raw_text),
            'items': self._extract_line_items(raw_text),
            'tax_amount': self._extract_tax_amount(raw_text),
            'address': self._extract_address(raw_text),
            'phone': self._extract_phone(raw_text),
            'confidence_score': self._calculate_confidence_score(raw_text)
        }

        return extracted_data

    def _extract_merchant_name(self, text):
        """Extract merchant/store name from receipt text"""
        lines = text.split('\n')

        # Common merchant name patterns
        merchant_patterns = [
            r'^[A-Z][A-Z\s&]+[A-Z]$',  # All caps company names
            r'^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$',  # 1-4 word company names
        ]

        # Look in first few lines for merchant name
        for line in lines[:5]:
            line = line.strip()
            if len(line) < 3 or len(line) > 50:
                continue

            for pattern in merchant_patterns:
                if re.match(pattern, line):
                    return line

        # Fallback: return first non-empty line
        for line in lines:
            line = line.strip()
            if line and len(line) > 2:
                return line

        return None

    def _extract_total_amount(self, text):
        """Extract total amount from receipt text"""
        # Common total amount patterns
        patterns = [
            r'(?i)total[:\s]*\$?([\d,]+\.\d{2})',
            r'(?i)amount[:\s]*\$?([\d,]+\.\d{2})',
            r'(?i)sum[:\s]*\$?([\d,]+\.\d{2})',
            r'\$([\d,]+\.\d{2})\s*$',  # Amount at end of line
            r'([\d,]+\.\d{2})\s*(?:total|sum|amount)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                # Return the largest amount found (likely the total)
                amounts = [float(match.replace(',', '')) for match in matches]
                return max(amounts)

        return None

    def _extract_date(self, text):
        """Extract date from receipt text"""
        # Common date patterns
        patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2})',
            r'(\d{2,4}[/-]\d{1,2}[/-]\d{1,2})',
            r'(\w{3}\s+\d{1,2},?\s+\d{4})',  # Jan 15, 2024
            r'(\d{1,2}\s+\w{3}\s+\d{4})',    # 15 Jan 2024
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                date_str = matches[0]
                return self._parse_date(date_str)

        return None

    def _parse_date(self, date_str):
        """Parse date string into datetime object"""
        date_formats = [
            '%m/%d/%Y', '%m-%d-%Y', '%m/%d/%y', '%m-%d-%y',
            '%Y/%m/%d', '%Y-%m-%d',
            '%d/%m/%Y', '%d-%m-%Y', '%d/%m/%y', '%d-%m-%y',
            '%b %d, %Y', '%B %d, %Y', '%d %b %Y', '%d %B %Y'
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        return None

    def _extract_line_items(self, text):
        """Extract individual line items from receipt"""
        lines = text.split('\n')
        items = []

        # Pattern to match line items (item name and price)
        item_pattern = r'^(.+?)\s+\$?([\d,]+\.\d{2})$'

        for line in lines:
            line = line.strip()
            match = re.match(item_pattern, line)
            if match:
                item_name = match.group(1).strip()
                item_price = float(match.group(2).replace(',', ''))

                # Filter out likely non-items
                if not any(skip in item_name.lower() for skip in ['total', 'tax', 'tip', 'subtotal', 'change', 'cash']):
                    items.append({
                        'name': item_name,
                        'price': item_price
                    })

        return items

    def _extract_tax_amount(self, text):
        """Extract tax amount from receipt"""
        patterns = [
            r'(?i)tax[:\s]*\$?([\d,]+\.\d{2})',
            r'(?i)hst[:\s]*\$?([\d,]+\.\d{2})',
            r'(?i)gst[:\s]*\$?([\d,]+\.\d{2})',
            r'(?i)pst[:\s]*\$?([\d,]+\.\d{2})',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                return float(matches[0].replace(',', ''))

        return 0.0

    def _extract_address(self, text):
        """Extract address from receipt"""
        lines = text.split('\n')

        # Look for address patterns
        address_patterns = [
            r'\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive)',
            r'[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}',  # City, ST ZIP
        ]

        for line in lines:
            for pattern in address_patterns:
                if re.search(pattern, line):
                    return line.strip()

        return None

    def _extract_phone(self, text):
        """Extract phone number from receipt"""
        phone_pattern = r'\(?([\d]{3})\)?[-\s\.]?([\d]{3})[-\s\.]?([\d]{4})'

        match = re.search(phone_pattern, text)
        if match:
            return f"({match.group(1)}) {match.group(2)}-{match.group(3)}"

        return None

    def _calculate_confidence_score(self, text):
        """Calculate confidence score based on extracted data quality"""
        score = 0.0

        if text and len(text.strip()) > 10:
            score += 0.2

        # Check for common receipt elements
        if re.search(r'\$[\d,]+\.\d{2}', text):  # Dollar amounts
            score += 0.2

        if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text):  # Dates
            score += 0.2

        if re.search(r'(?i)total', text):  # Total keyword
            score += 0.2

        if len(text.split('\n')) > 5:  # Multiple lines
            score += 0.2

        return min(score, 1.0)
