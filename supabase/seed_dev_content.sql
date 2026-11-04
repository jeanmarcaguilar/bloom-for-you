-- DEV ONLY: sample published content so /garden and /letters aren't empty. Run after seed_dev_users.sql.
insert into public.flowers (owner_id, title, flower_type, color, message, dedication, status)
select id, t, ft, c, m, 'For you', 'published' from public.profiles,
 (values ('First Rose','rose','#D96C91','Every petal is a thought of you.'),
         ('Sunny Day','sunflower','#F5B82E','You make ordinary days bright.'),
         ('Little Daisy','daisy','#FFFFFF','Simple, honest, and always yours.')) v(t,ft,c,m)
where role = 'owner';
insert into public.letters (owner_id, title, preview, body, category, signature, status)
select id, 'Open when you miss me', 'A little note for the quiet moments', E'Hi love,\n\nIf you are reading this, I am thinking of you too.\n\nAlways.', 'open_when_you_miss_me', '— Me', 'published'
from public.profiles where role = 'owner';
