
-- Public read of approved pharmacies & active branches (for the map / locator)
GRANT SELECT ON public.pharmacies TO anon;
GRANT SELECT ON public.branches TO anon;
GRANT SELECT ON public.inventory TO anon;

CREATE POLICY "Approved pharmacies public read"
  ON public.pharmacies FOR SELECT TO anon
  USING (status = 'approved');

CREATE POLICY "Active branches public read"
  ON public.branches FOR SELECT TO anon
  USING (is_active AND EXISTS (SELECT 1 FROM public.pharmacies p WHERE p.id = branches.pharmacy_id AND p.status = 'approved'));

CREATE POLICY "Inventory public read"
  ON public.inventory FOR SELECT TO anon
  USING (quantity > 0);

-- Seed medicines (common Tunisian pharmacy catalog).
INSERT INTO public.medicines (brand_name, generic_name, name_fr, name_ar, name_en, manufacturer, category, dosage, form, requires_prescription) VALUES
('Doliprane','Paracetamol','Doliprane','دوليبران','Doliprane','Sanofi','Antalgique','500 mg','Comprimé',false),
('Doliprane 1000','Paracetamol','Doliprane 1000','دوليبران 1000','Doliprane 1000','Sanofi','Antalgique','1000 mg','Comprimé',false),
('Efferalgan','Paracetamol','Efferalgan','إفيرالغان','Efferalgan','UPSA','Antalgique','500 mg','Comprimé effervescent',false),
('Panadol','Paracetamol','Panadol','بانادول','Panadol','GSK','Antalgique','500 mg','Comprimé',false),
('Advil','Ibuprofen','Advil','أدفيل','Advil','Pfizer','AINS','400 mg','Comprimé',false),
('Brufen','Ibuprofen','Brufen','بروفين','Brufen','Abbott','AINS','400 mg','Comprimé',false),
('Nurofen','Ibuprofen','Nurofen','نوروفين','Nurofen','Reckitt','AINS','200 mg','Comprimé',false),
('Aspégic','Acide acétylsalicylique','Aspégic','أسبيجيك','Aspegic','Sanofi','Antiagrégant','100 mg','Sachet',false),
('Aspirine','Acide acétylsalicylique','Aspirine','أسبرين','Aspirin','Bayer','Antalgique','500 mg','Comprimé',false),
('Voltarène','Diclofénac','Voltarène','فولتارين','Voltaren','Novartis','AINS','50 mg','Comprimé',true),
('Augmentin','Amoxicilline + Acide clavulanique','Augmentin','أوغمنتين','Augmentin','GSK','Antibiotique','1 g','Comprimé',true),
('Clamoxyl','Amoxicilline','Clamoxyl','كلاموكسيل','Clamoxyl','GSK','Antibiotique','500 mg','Gélule',true),
('Zithromax','Azithromycine','Zithromax','زيتروماكس','Zithromax','Pfizer','Antibiotique','500 mg','Comprimé',true),
('Rocéphine','Ceftriaxone','Rocéphine','روسيفين','Rocephin','Roche','Antibiotique','1 g','Injection',true),
('Bactrim','Sulfaméthoxazole + Triméthoprime','Bactrim','باكتريم','Bactrim','Roche','Antibiotique','480 mg','Comprimé',true),
('Flagyl','Métronidazole','Flagyl','فلاجيل','Flagyl','Sanofi','Antibiotique','500 mg','Comprimé',true),
('Ciflox','Ciprofloxacine','Ciflox','سيفلوكس','Ciflox','Bayer','Antibiotique','500 mg','Comprimé',true),
('Spasfon','Phloroglucinol','Spasfon','سباسفون','Spasfon','Teva','Antispasmodique','80 mg','Comprimé',false),
('Smecta','Diosmectite','Smecta','سميكتا','Smecta','Ipsen','Anti-diarrhéique','3 g','Sachet',false),
('Imodium','Lopéramide','Imodium','إيموديوم','Imodium','J&J','Anti-diarrhéique','2 mg','Gélule',false),
('Maalox','Hydroxyde aluminium/magnésium','Maalox','مالوكس','Maalox','Sanofi','Antiacide','—','Suspension',false),
('Mopral','Oméprazole','Mopral','موبرال','Mopral','AstraZeneca','IPP','20 mg','Gélule',true),
('Inexium','Esoméprazole','Inexium','إينكسيوم','Nexium','AstraZeneca','IPP','40 mg','Comprimé',true),
('Motilium','Dompéridone','Motilium','موتيليوم','Motilium','J&J','Antiémétique','10 mg','Comprimé',true),
('Primperan','Métoclopramide','Primperan','بريمبيران','Primperan','Sanofi','Antiémétique','10 mg','Comprimé',true),
('Ventoline','Salbutamol','Ventoline','فينتولين','Ventolin','GSK','Bronchodilatateur','100 µg','Inhalateur',true),
('Seretide','Salmétérol + Fluticasone','Seretide','سيريتايد','Seretide','GSK','Anti-asthmatique','25/250 µg','Inhalateur',true),
('Symbicort','Budésonide + Formotérol','Symbicort','سيمبيكورت','Symbicort','AstraZeneca','Anti-asthmatique','160/4,5 µg','Inhalateur',true),
('Glucophage','Metformine','Glucophage','جلوكوفاج','Glucophage','Merck','Antidiabétique','850 mg','Comprimé',true),
('Diamicron','Gliclazide','Diamicron','دياميكرون','Diamicron','Servier','Antidiabétique','30 mg','Comprimé LM',true),
('Lantus','Insuline glargine','Lantus','لانتوس','Lantus','Sanofi','Insuline','100 UI/ml','Stylo',true),
('Lipitor','Atorvastatine','Lipitor','ليبيتور','Lipitor','Pfizer','Hypolipémiant','20 mg','Comprimé',true),
('Crestor','Rosuvastatine','Crestor','كريستور','Crestor','AstraZeneca','Hypolipémiant','10 mg','Comprimé',true),
('Tahor','Atorvastatine','Tahor','تاهور','Tahor','Pfizer','Hypolipémiant','40 mg','Comprimé',true),
('Coversyl','Périndopril','Coversyl','كوفرسيل','Coversyl','Servier','Antihypertenseur','5 mg','Comprimé',true),
('Triatec','Ramipril','Triatec','تريتاك','Triatec','Sanofi','Antihypertenseur','5 mg','Comprimé',true),
('Tenormin','Aténolol','Tenormin','تينورمين','Tenormin','AstraZeneca','Bêta-bloquant','50 mg','Comprimé',true),
('Lasilix','Furosémide','Lasilix','لازيليكس','Lasilix','Sanofi','Diurétique','40 mg','Comprimé',true),
('Plavix','Clopidogrel','Plavix','بلافيكس','Plavix','Sanofi','Antiagrégant','75 mg','Comprimé',true),
('Préviscan','Fluindione','Préviscan','بريفيسكان','Previscan','Merck','Anticoagulant','20 mg','Comprimé',true),
('Xanax','Alprazolam','Xanax','زاناكس','Xanax','Pfizer','Anxiolytique','0,25 mg','Comprimé',true),
('Lexomil','Bromazépam','Lexomil','ليكسوميل','Lexomil','Roche','Anxiolytique','6 mg','Comprimé',true),
('Tranxène','Clorazépate','Tranxène','ترانكسين','Tranxene','Sanofi','Anxiolytique','5 mg','Gélule',true),
('Prozac','Fluoxétine','Prozac','بروزاك','Prozac','Lilly','Antidépresseur','20 mg','Gélule',true),
('Deroxat','Paroxétine','Deroxat','ديروكسات','Deroxat','GSK','Antidépresseur','20 mg','Comprimé',true),
('Solupred','Prednisolone','Solupred','سولوبريد','Solupred','Sanofi','Corticoïde','20 mg','Comprimé',true),
('Cortancyl','Prednisone','Cortancyl','كورتانسيل','Cortancyl','Sanofi','Corticoïde','5 mg','Comprimé',true),
('Aerius','Desloratadine','Aerius','إيريوس','Aerius','MSD','Antihistaminique','5 mg','Comprimé',false),
('Zyrtec','Cétirizine','Zyrtec','زيرتك','Zyrtec','UCB','Antihistaminique','10 mg','Comprimé',false),
('Clarityne','Loratadine','Clarityne','كلاريتين','Claritin','Bayer','Antihistaminique','10 mg','Comprimé',false),
('Toplexil','Oxomémazine','Toplexil','توبليكسيل','Toplexil','Sanofi','Antitussif','—','Sirop',false),
('Mucomyst','Acétylcystéine','Mucomyst','موكوميست','Mucomyst','BMS','Mucolytique','200 mg','Sachet',false),
('Mucosolvan','Ambroxol','Mucosolvan','موكوسولفان','Mucosolvan','BI','Mucolytique','30 mg','Comprimé',false),
('Pivalone','Tixocortol','Pivalone','بيفالون','Pivalone','Théa','Décongestionnant nasal','1%','Spray',false),
('Cébion','Vitamine C','Cébion','سيبيون','Cebion','Merck','Vitamine','1 g','Comprimé eff.',false),
('Calcidose','Calcium + Vitamine D','Calcidose','كالسيدوز','Calcidose','Innotech','Supplément','500 mg/400 UI','Sachet',false),
('Spéciafoldine','Acide folique','Spéciafoldine','سبيسيافولدين','Speciafoldine','Bayer','Vitamine','5 mg','Comprimé',false),
('Tardyferon','Sulfate ferreux','Tardyferon','تارديفيرون','Tardyferon','Pierre Fabre','Fer','80 mg','Comprimé',false),
('Magné B6','Magnésium + B6','Magné B6','ماغني بي 6','Magne B6','Sanofi','Supplément','—','Comprimé',false),
('Daktarin','Miconazole','Daktarin','دكتارين','Daktarin','J&J','Antifongique','2%','Crème',false),
('Locapred','Désonide','Locapred','لوكابريد','Locapred','Pierre Fabre','Corticoïde topique','0,1%','Crème',true),
('Betadine','Povidone iodée','Betadine','بيتادين','Betadine','Mundipharma','Antiseptique','10%','Solution',false),
('Doliprane Pédiatrique','Paracetamol','Doliprane sirop enfant','دوليبران أطفال','Doliprane pediatric','Sanofi','Antalgique','2,4%','Sirop',false),
('Pivmecillinam','Pivmécillinam','Selexid','سيليكسيد','Selexid','Leo Pharma','Antibiotique','200 mg','Comprimé',true),
('Levothyrox','Lévothyroxine','Levothyrox','ليفوتيروكس','Levothyrox','Merck','Hormone thyroïdienne','100 µg','Comprimé',true)
ON CONFLICT (barcode) DO NOTHING;
